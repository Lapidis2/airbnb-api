import prisma from "../../config/prismaConfig";
import { model } from "../../config/ai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

type MessageRole = "system" | "human" | "ai";

interface ChatMessage {
  role: MessageRole;
  content: string;
}

interface ChatSession {
  messages: ChatMessage[];
  updatedAt: number;
}

const SESSION_MAX_AGE = 30 * 60 * 1000;
const MAX_HISTORY_EXCHANGES = 10;

const sessions = new Map<string, ChatSession>();

const getListingContext = async (listingId: string): Promise<string | null> => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        title: true,
        location: true,
        pricePerNight: true,
        guests: true,
        type: true,
        amenities: true,
        description: true,
      },
    });

    if (!listing) return null;

    return `Title: ${listing.title}
Location: ${listing.location}
Price per night: $${listing.pricePerNight}
Max guests: ${listing.guests}
Type: ${listing.type}
Amenities: ${listing.amenities.join(", ")}
Description: ${listing.description}`;
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
};

const trimHistory = (messages: ChatMessage[]): ChatMessage[] => {
  const nonSystem = messages.filter((m) => m.role !== "system");
  const maxMessages = MAX_HISTORY_EXCHANGES * 2;

  if (nonSystem.length <= maxMessages) {
    return messages;
  }

  const systemMessage = messages.find((m) => m.role === "system");
  const trimmedNonSystem = nonSystem.slice(-maxMessages);

  return systemMessage ? [systemMessage, ...trimmedNonSystem] : trimmedNonSystem;
};

export const sendChatMessage = async (
  sessionId: string,
  message: string,
  listingId?: string
): Promise<{
  response: string;
  sessionId: string;
  messageCount: number;
}> => {
  const now = Date.now();

  let session = sessions.get(sessionId);

  if (!session) {
    session = {
      messages: [],
      updatedAt: now,
    };
  } else {
    session.updatedAt = now;
  }

  let systemPrompt: string | undefined;

  if (listingId) {
    const listingContext = await getListingContext(listingId);

    if (!listingContext) {
      const error = new Error("Listing not found");
      (error as any).statusCode = 404;
      throw error;
    }

    systemPrompt = `You are a helpful guest support assistant for an Airbnb-like platform.
You are currently helping a guest with questions about this specific listing:

${listingContext}

Answer questions about this listing accurately based on the details above.
If asked something not covered by the listing details, say you don't have that information.
Be concise and helpful.`;
  } else {
    systemPrompt = `You are a helpful guest support assistant for an Airbnb-like platform.
Answer general questions about bookings, listings, hosts, and platform policies.
Be friendly, concise, and helpful.`;
  }

  const systemMessage: ChatMessage = { role: "system", content: systemPrompt };

  const hasSystem = session.messages.some((m) => m.role === "system");

  if (!hasSystem) {
    session.messages.push(systemMessage);
  } else {
    session.messages = session.messages.map((m) =>
      m.role === "system" ? systemMessage : m
    );
  }

  session.messages.push({ role: "human", content: message });

  try {
    const langChainMessages = session.messages.map((msg) => {
      switch (msg.role) {
        case "system":
          return new SystemMessage(msg.content);
        case "human":
          return new HumanMessage(msg.content);
        case "ai":
          return new AIMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });

    const response = await model.invoke(langChainMessages);
    const aiMessage = response.content as string;

    session.messages.push({ role: "ai" as const, content: aiMessage });

    session.messages = trimHistory(session.messages);

    sessions.set(sessionId, session);

    return {
      response: aiMessage,
      sessionId,
      messageCount: session.messages.filter((m) => m.role !== "system").length,
    };
  } catch (error: any) {
    if (error?.status === 429) {
      const groqError = new Error("AI service is busy, please try again in a moment");
      (groqError as any).statusCode = 429;
      throw groqError;
    }
    if (error?.status === 401) {
      const configError = new Error("AI service configuration error");
      (configError as any).statusCode = 500;
      throw configError;
    }
    console.error("Chat error:", error);
    throw new Error("Failed to get response from AI");
  }
};

export const cleanupSessions = (): void => {
  const cutoff = Date.now() - SESSION_MAX_AGE;
  for (const [key, session] of sessions.entries()) {
    if (session.updatedAt < cutoff) {
      sessions.delete(key);
    }
  }
};

setInterval(cleanupSessions, 5 * 60 * 1000);

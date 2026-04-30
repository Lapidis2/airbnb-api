import prisma from "../../config/prismaConfig";
import { model } from "../../config/ai";
import { Prisma } from "@prisma/client";

interface RecommendationFilters {
  location: string | null;
  type: string | null;
  maxPrice: number | null;
  guests: number | null;
}

interface AIRecommendationOutput {
  preferences: string;
  searchFilters: RecommendationFilters;
  reason: string;
}

interface BookingWithListing {
  id: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  listing: {
    id: string;
    title: string;
    location: string;
    pricePerNight: number;
    guests: number;
    type: string;
  };
}

export const getRecommendations = async (
  userId: string
): Promise<{
  preferences: string;
  reason: string;
  searchFilters: RecommendationFilters;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    pricePerNight: number;
    guests: number;
    type: string;
    amenities: string[];
    host: {
      name: string;
      avatar: string | null;
    };
  }>;
}> => {
  const bookings = await prisma.booking.findMany({
    where: { guestId: userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          location: true,
          pricePerNight: true,
          guests: true,
          type: true,
        },
      },
    },
  });

  if (bookings.length === 0) {
    const error = new Error("No booking history found. Make some bookings first to get recommendations.");
    (error as any).statusCode = 400;
    throw error;
  }

  const bookingHistory: BookingWithListing[] = bookings.map((b: any) => ({
    id: b.id,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    totalPrice: b.totalPrice,
    listing: {
      id: b.listing.id,
      title: b.listing.title,
      location: b.listing.location,
      pricePerNight: b.listing.pricePerNight,
      guests: b.listing.guests,
      type: b.listing.type,
    },
  }));

  const bookingSummary = bookingHistory
    .map(
      (b) => `- ${b.listing.type} in ${b.listing.location} for ${b.listing.guests} guests at $${b.listing.pricePerNight}/night`
    )
    .join("\n");

  const systemPrompt = `You are a recommendation assistant for an Airbnb-like platform.
Analyze the user's booking history and infer their preferences.

Based on the history, output ONLY a valid JSON object with these fields:
{
  "preferences": "string describing what the user likes",
  "searchFilters": {
    "location": "string or null",
    "type": "string or null (one of APARTMENT, HOUSE, VILLA, CABIN)",
    "maxPrice": "number or null",
    "guests": "number or null"
  },
  "reason": "string explaining why these filters were chosen"
}

Return ONLY JSON, no other text.`;

  const humanPrompt = `User's booking history (most recent first):
${bookingSummary}

Based on this history, what are their preferences and what should we recommend?`;

  if (!model) {
    throw new Error("AI service is not configured. Please check your GROQ_API_KEY environment variable.");
  }

  try {
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "human", content: humanPrompt },
    ]);

    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response");
    }

    const parsed: AIRecommendationOutput = JSON.parse(jsonMatch[0]);

    const where: Prisma.ListingWhereInput = {};

    if (parsed.searchFilters.location) {
      where.location = {
        contains: parsed.searchFilters.location,
        mode: "insensitive" as Prisma.QueryMode,
      };
    }

    if (parsed.searchFilters.type && ["APARTMENT", "HOUSE", "VILLA", "CABIN"].includes(parsed.searchFilters.type)) {
      where.type = parsed.searchFilters.type as Prisma.EnumListingTypeFilter;
    }

    if (parsed.searchFilters.maxPrice !== null) {
      where.pricePerNight = { lte: parsed.searchFilters.maxPrice };
    }

    if (parsed.searchFilters.guests !== null) {
      where.guests = { gte: parsed.searchFilters.guests };
    }

    const bookedListingIds = bookingHistory.map((b) => b.listing.id);

    if (bookedListingIds.length > 0) {
      where.id = { notIn: bookedListingIds };
    }

    const recommendations = await prisma.listing.findMany({
      where,
      take: 10,
      include: {
        host: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { rating: "desc" },
    });

    return {
      preferences: parsed.preferences,
      reason: parsed.reason,
      searchFilters: parsed.searchFilters,
      recommendations,
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
    console.error("Recommendation error:", error);
    throw new Error("Failed to generate recommendations");
  }
};

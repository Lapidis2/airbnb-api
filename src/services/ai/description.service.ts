import prisma from "../../config/prismaConfig";
import { model } from "../../config/ai";
import { AuthRequest } from "../../middlewares/auth.middleware";

type Tone = "professional" | "casual" | "luxury";

interface ListingWithHost {
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
}

interface DescriptionPromptParams {
  title: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: string;
  amenities: string[];
}

const getToneInstructions = (tone: Tone): string => {
  switch (tone) {
    case "professional":
      return "Write in a formal, clear, business-like tone that is informative and professional.";
    case "casual":
      return "Write in a friendly, relaxed, conversational tone that feels warm and inviting.";
    case "luxury":
      return "Write in an elegant, premium, aspirational tone that conveys exclusivity and high-end quality.";
    default:
      return "Write in a professional tone.";
  }
};

export const generateDescription = async (
  listingId: string,
  userId: string,
  tone: Tone = "professional"
): Promise<{
  description: string;
  listing: ListingWithHost;
}> => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      host: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  });

  if (!listing) {
    const error = new Error("Listing not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (listing.hostId !== userId) {
    const error = new Error("Unauthorized: Not the owner");
    (error as any).statusCode = 403;
    throw error;
  }

  const params: DescriptionPromptParams = {
    title: listing.title,
    location: listing.location,
    pricePerNight: listing.pricePerNight,
    guests: listing.guests,
    type: listing.type,
    amenities: listing.amenities,
  };

  const toneInstructions = getToneInstructions(tone);

  const systemPrompt = `You are an expert copywriter for vacation rentals.
Write a compelling listing description based on the provided details.

${toneInstructions}

Structure:
- Engaging opening paragraph highlighting the property's best features
- Describe the space, amenities, and what guests can expect
- Mention the location and nearby attractions
- End with a call to action or summary

Keep the description between 150-250 words.
Make it unique, vivid, and appealing to potential guests.

Property details:
Title: ${params.title}
Location: ${params.location}
Price per night: $${params.pricePerNight}
Max guests: ${params.guests}
Type: ${params.type}
Amenities: ${params.amenities.join(", ")}`;

  try {
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
    ]);

    const generatedDescription = response.content as string;

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: { description: generatedDescription },
      include: {
        host: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      description: generatedDescription,
      listing: updatedListing,
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
    console.error("Description generation error:", error);
    throw new Error("Failed to generate description");
  }
};

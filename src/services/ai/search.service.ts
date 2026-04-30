import prisma from "../../config/prismaConfig";
import { extractionModel } from "../../config/ai";
import { Prisma } from "@prisma/client";

export interface SearchFilters {
  location: string | null;
  type: string | null;
  maxPrice: number | null;
  guests: number | null;
}

export interface AISearchResult {
  filters: SearchFilters;
  data: (ListingWithHost & { host: { name: string; email: string } })[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListingWithHost extends Prisma.ListingGetPayload<{
  include: {
    host: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}> {}

export const extractFilters = async (query: string): Promise<SearchFilters> => {
  if (!extractionModel) {
    throw new Error("AI service is not configured. Please check your GROQ_API_KEY environment variable.");
  }

  const systemPrompt = `You are a filter extraction assistant for an Airbnb-like rental platform.
Given a user's search query, extract structured filters and return ONLY a JSON object with these fields:
- location: string (city/area name) or null if not mentioned
- type: one of "APARTMENT", "HOUSE", "VILLA", "CABIN" or null if not mentioned
- maxPrice: number (maximum price per night) or null if not mentioned
- guests: number (number of guests) or null if not mentioned

IMPORTANT: Return ONLY the JSON object, no additional text or markdown.`;

  const humanPrompt = `Extract filters from this query: "${query}"`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "human", content: humanPrompt },
    ];

    const response = await extractionModel.invoke(messages);

    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      location: parsed.location || null,
      type: parsed.type ? parsed.type.toUpperCase() : null,
      maxPrice: parsed.maxPrice || null,
      guests: parsed.guests || null,
    };
  } catch (error) {
    console.error("Filter extraction error:", error);
    throw new Error("Failed to extract filters from AI response");
  }
};

export const searchListingsWithAI = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<AISearchResult> => {
  if (!query || query.trim().length < 3) {
    throw new Error("Query must be at least 3 characters");
  }

  const filters = await extractFilters(query);

  const allNull = !filters.location && !filters.type && !filters.maxPrice && !filters.guests;

  if (allNull) {
    const error = new Error("Could not extract any filters from your query. Please include details like location, property type, price, or number of guests.");
    (error as any).statusCode = 400;
    throw error;
  }

  const skip = (page - 1) * limit;
  const where: Prisma.ListingWhereInput = {};

  if (filters.location) {
    where.location = {
      contains: filters.location,
      mode: "insensitive" as Prisma.QueryMode,
    };
  }

  if (filters.type && ["APARTMENT", "HOUSE", "VILLA", "CABIN"].includes(filters.type)) {
    where.type = filters.type as Prisma.EnumListingTypeFilter;
  }

  if (filters.maxPrice !== null) {
    where.pricePerNight = { lte: filters.maxPrice };
  }

  if (filters.guests !== null) {
    where.guests = { gte: filters.guests };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limit,
      include: {
        host: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    filters,
    data: listings,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

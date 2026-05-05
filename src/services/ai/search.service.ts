import prisma from "../../config/prismaConfig";
import { extractionModel } from "../../config/ai";
import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/AppError";

export interface SearchFilters {
  location: string | null;
  type: string | null;
  maxPrice: number | null;
  guests: number | null;
  amenities: string[];
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
    throw new AppError("AI service is not configured. Please check your GROQ_API_KEY environment variable.", 503);
  }

  const systemPrompt = `You are a strict backend filter extraction system for a property listing search API.

Your job is to extract structured filters from a user query.

📥 Output Format (MANDATORY)

Always return ONLY valid JSON in this exact shape:

{
  "success": true | false,
  "filters": {
    "location": string | null,
    "type": "APARTMENT" | "HOUSE" | "VILLA" | "CABIN" | null,
    "maxPrice": number | null,
    "guests": number | null,
    "amenities": string[]
  }
}
🎯 Extraction Rules

Location

Extract ONLY if it is a clearly known real place (e.g., Kigali, Gasabo, Kicukiro)
DO NOT assume unknown or random words are locations
If unsure → return null

Type

apartment, flat → APARTMENT
house, home → HOUSE
villa → VILLA
cabin → CABIN

Max Price

Extract from "$100", "under 200", "less than 50", etc.
Return number only

Guests

Extract from "2 guests", "for 3 people", etc.

Amenities

Extract: wifi, parking, pool, kitchen, ac, tv, security
Return as lowercase array
🚨 STRICT FAILURE RULE

If ALL of the following are empty:

location = null
type = null
maxPrice = null
guests = null
amenities = []

Then you MUST return:

{
  "success": false,
  "filters": {
    "location": null,
    "type": null,
    "maxPrice": null,
    "guests": null,
    "amenities": []
  }
}
⚠️ CRITICAL RULES
DO NOT guess or hallucinate values
DO NOT treat unknown words (e.g., random or Kinyarwanda terms) as location
DO NOT return explanations, only JSON
Output must be directly parseable`;

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
      throw new AppError("Failed to parse AI response", 500);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!parsed.filters || typeof parsed.success !== 'boolean') {
      throw new AppError("Invalid AI response structure", 500);
    }

    const filters = parsed.filters;

    // If success is false or all filters are empty, return failure
    if (!parsed.success ||
        (!filters.location && !filters.type && !filters.maxPrice && !filters.guests && (!filters.amenities || filters.amenities.length === 0))) {
      return {
        location: null,
        type: null,
        maxPrice: null,
        guests: null,
        amenities: []
      };
    }

    return {
      location: filters.location || null,
      type: filters.type || null,
      maxPrice: filters.maxPrice || null,
      guests: filters.guests || null,
      amenities: filters.amenities || []
    };
  } catch (error) {
    console.error("Filter extraction error:", error);
    throw new AppError("Failed to extract filters from AI response", 500);
  }
};

export const searchListingsWithAI = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<AISearchResult> => {
  if (!query || query.trim().length < 3) {
    throw new AppError("Query must be at least 3 characters", 400);
  }

  const filters = await extractFilters(query);

  // Check if extraction failed (all filters are null/empty)
  const allEmpty = !filters.location && !filters.type && !filters.maxPrice && !filters.guests && (!filters.amenities || filters.amenities.length === 0);

  if (allEmpty) {
    throw new AppError("Could not extract any filters from your query. Please be more specific about location, property type, price, number of guests, or amenities.", 400);
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

  if (filters.amenities && filters.amenities.length > 0) {
    // Check that the listing has ALL requested amenities
    where.amenities = {
      hasEvery: filters.amenities
    };
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

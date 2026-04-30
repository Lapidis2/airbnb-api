import prisma from "../../config/prismaConfig";
import { model } from "../../config/ai";
import { getCache, setCache, clearCache as clearGenericCache } from "../../config/cache";

interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: {
    name: string;
  };
}

interface ReviewSummaryOutput {
  summary: string;
  positives: string[];
  negatives: string[];
}

const REVIEW_SUMMARY_CACHE_KEY = (listingId: string) => `review-summary:${listingId}`;
const CACHE_TTL = 600;

export const getReviewSummary = async (listingId: string): Promise<{
  summary: string;
  positives: string[];
  negatives: string[];
  averageRating: number;
  totalReviews: number;
}> => {
  const cacheKey = REVIEW_SUMMARY_CACHE_KEY(listingId);
  const cached = getCache<{
    summary: string;
    positives: string[];
    negatives: string[];
    averageRating: number;
    totalReviews: number;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    const error = new Error("Listing not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const reviews = await prisma.review.findMany({
    where: { listingId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (reviews.length < 3) {
    const error = new Error("Not enough reviews to generate a summary (minimum 3 required)");
    (error as any).statusCode = 400;
    throw error;
  }

  const reviewsText = reviews
    .map(
      (r) => `Review by ${r.user.name} (${r.rating}/5): ${r.comment}`
    )
    .join("\n\n");

  const systemPrompt = `You are an assistant that summarizes guest reviews for vacation rental listings.
Given a list of reviews, provide a structured summary.

Return ONLY a valid JSON object with these fields:
{
  "summary": "2-3 sentence overall summary of guest experience",
  "positives": ["array of 3 things guests consistently praised"],
  "negatives": ["array of things guests complained about"]
}

Guidelines:
- Extract recurring themes from the reviews
- For positives, list the most commonly mentioned strengths (exactly 3 items)
- For negatives, list any consistent complaints or issues (can be empty array)
- Keep summary concise and objective
- Base everything strictly on the provided reviews

Return ONLY JSON, no other text.`;

  const humanPrompt = `Here are the reviews for this listing:

${reviewsText}`;

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

     const parsed: ReviewSummaryOutput = JSON.parse(jsonMatch[0]);

  const averageRating =
    reviews.reduce((sum: number, r: ReviewWithUser) => sum + r.rating, 0) / reviews.length;

    const result = {
      summary: parsed.summary,
      positives: parsed.positives || [],
      negatives: parsed.negatives || [],
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    };

    setCache(cacheKey, result, CACHE_TTL);

    return result;
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
    console.error("Review summary error:", error);
    throw new Error("Failed to generate review summary");
  }
};

export const invalidateReviewSummaryCache = (listingId: string): void => {
  clearGenericCache(REVIEW_SUMMARY_CACHE_KEY(listingId));
};

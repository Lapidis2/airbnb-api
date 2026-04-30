import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { searchListingsWithAI } from "../services/ai/search.service";
import { generateDescription } from "../services/ai/description.service";
import { sendChatMessage } from "../services/ai/chat.service";
import { getRecommendations } from "../services/recommendation/recommendation.service";
import { getReviewSummary } from "../services/ai/review-summary.service";

export const aiSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.status(400).json({ message: "Query is required" });
      return;
    }

    const result = await searchListingsWithAI(query, page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("AI Search error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "AI search failed" });
  }
};

export const generateDescriptionController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { tone = "professional" } = req.body;

    const validTones = ["professional", "casual", "luxury"];
    if (!validTones.includes(tone)) {
      res.status(400).json({ message: "Invalid tone. Must be one of: professional, casual, luxury" });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await generateDescription(id, req.userId, tone as "professional" | "casual" | "luxury");
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Generate description error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Failed to generate description" });
  }
};

export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, message, listingId } = req.body;

    if (!sessionId || typeof sessionId !== "string" || sessionId.trim().length === 0) {
      res.status(400).json({ message: "sessionId is required" });
      return;
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ message: "message is required" });
      return;
    }

    const result = await sendChatMessage(sessionId, message, listingId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Chat error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Chat failed" });
  }
};

export const getRecommendationsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await getRecommendations(req.userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Recommendation error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Failed to get recommendations" });
  }
};

export const getReviewSummaryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await getReviewSummary(id);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Review summary error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Failed to get review summary" });
  }
};

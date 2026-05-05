import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { searchListingsWithAI } from "../services/ai/search.service";
// import { generateDescription } from "../services/ai/description.service";
// import { sendChatMessage } from "../services/ai/chat.service";
// import { getRecommendations } from "../services/recommendation/recommendation.service";
// import { getReviewSummary } from "../services/ai/review-summary.service";
import { AppError } from "../errors/AppError";
import { createSuccessResponse } from "../utils/apiResponse";

export const aiSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || typeof query !== 'string') {
      throw new AppError("Query parameter is required and must be a string", 400);
    }

    const result = await searchListingsWithAI(query, page, limit);

    res.status(200).json({
      success: true,
      message: "Search completed",
      data: result.data,
      meta: result.meta,
      filters: result.filters
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      console.error("AI search error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during AI search"
      });
    }
  }
};

export const generateDescriptionController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.status(503).json({ message: "AI description generation temporarily disabled" });
};

export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
  res.status(503).json({ message: "AI chat temporarily disabled" });
};

export const getRecommendationsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.status(503).json({ message: "AI recommendations temporarily disabled" });
};

export const getReviewSummaryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(503).json({ message: "AI review summary temporarily disabled" });
};

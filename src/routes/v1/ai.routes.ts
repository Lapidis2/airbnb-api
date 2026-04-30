import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";

const route = Router();

/**
 * @swagger
 * /api/v1/ai/search:
 *   post:
 *     summary: AI-Powered Smart Search
 *     tags: [AI Features]
 *     description: Search listings using natural language queries with AI-powered filter extraction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Natural language search query
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results with extracted filters and pagination
 *       400:
 *         description: Could not extract filters from query
 *       429:
 *         description: AI service is busy
 */
route.post("/search", async (req, res) => {
  try {
    // Lazy load AI controller to avoid initialization issues
    const { aiSearch } = await import("../../controllers/ai.controller");
    await aiSearch(req, res);
  } catch (error: any) {
    console.error("AI search route error:", error);
    res.status(429).json({
      message: "AI service is temporarily unavailable. Please use regular search endpoints.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/listings/{id}/generate-description:
 *   post:
 *     summary: AI Listing Description Generator
 *     tags: [AI Features]
 *     description: Generate a property description using AI with tone control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tone:
 *                 type: string
 *                 enum: [professional, casual, luxury]
 *                 default: professional
 *                 description: Writing tone for the description
 *     responses:
 *       200:
 *         description: Generated description and updated listing
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Listing not found
 *       429:
 *         description: AI service is busy
 */
route.post("/listings/:id/generate-description", authenticate, async (req, res) => {
  try {
    const { generateDescriptionController } = await import("../../controllers/ai.controller");
    await generateDescriptionController(req, res);
  } catch (error: any) {
    console.error("AI generate description route error:", error);
    res.status(429).json({
      message: "AI service is temporarily unavailable.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: AI Guest Support Chatbot
 *     tags: [AI Features]
 *     description: Chat with an AI assistant for guest support (optionally with listing context)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - message
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Unique session identifier for conversation history
 *               message:
 *                 type: string
 *                 description: User's message
 *               listingId:
 *                 type: string
 *                 description: Optional listing ID to provide context-specific answers
 *     responses:
 *       200:
 *         description: AI response with session tracking
 *       404:
 *         description: Listing not found
 *       429:
 *         description: AI service is busy
 */
route.post("/chat", async (req, res) => {
  try {
    const { chatWithAI } = await import("../../controllers/ai.controller");
    await chatWithAI(req, res);
  } catch (error: any) {
    console.error("AI chat route error:", error);
    res.status(429).json({
      message: "AI service is temporarily unavailable.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/recommend:
 *   post:
 *     summary: AI Booking-Based Recommendations
 *     tags: [AI Features]
 *     description: Get personalized listing recommendations based on your booking history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations based on booking history
 *       400:
 *         description: No booking history
 *       429:
 *         description: AI service is busy
 */
route.post("/recommend", authenticate, async (req, res) => {
  try {
    const { getRecommendationsController } = await import("../../controllers/ai.controller");
    await getRecommendationsController(req, res);
  } catch (error: any) {
    console.error("AI recommend route error:", error);
    res.status(429).json({
      message: "AI service is temporarily unavailable.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/listings/{id}/review-summary:
 *   get:
 *     summary: AI Review Summary
 *     tags: [AI Features]
 *     description: Get AI-generated summary of guest reviews for a listing (cached 10 minutes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: AI-generated review summary with average rating
 *       400:
 *         description: Not enough reviews (minimum 3 required)
 *       404:
 *         description: Listing not found
 *       429:
 *         description: AI service is busy
 */
route.get("/listings/:id/review-summary", async (req, res) => {
  try {
    const { getReviewSummaryController } = await import("../../controllers/ai.controller");
    await getReviewSummaryController(req, res);
  } catch (error: any) {
    console.error("AI review summary route error:", error);
    res.status(429).json({
      message: "AI service is temporarily unavailable.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default route;
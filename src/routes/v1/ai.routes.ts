import { Router } from "express";
import { aiSearch, generateDescriptionController, chatWithAI, getRecommendationsController, getReviewSummaryController } from "../../controllers/ai.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/ai/search:
 *   post:
 *     summary: AI-powered listing search
 *     tags: [AI]
 *     description: Search listings using AI-powered natural language processing and filters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of results per page
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AISearchInput'
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AISearchResponse'
 *       400:
 *         description: Invalid search parameters or query
 *       503:
 *         description: AI service not configured or unavailable
 */
router.post("/search", aiSearch);

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI]
 *     description: Send messages to the AI assistant for help with booking inquiries.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIChatInput'
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIChatResponse'
 *       503:
 *         description: AI chat service temporarily unavailable
 */
router.post("/chat", chatWithAI);

/**
 * @swagger
 * /api/v1/ai/reviews/{listingId}/summary:
 *   get:
 *     summary: Get AI-generated review summary
 *     tags: [AI]
 *     description: Generate an AI summary of all reviews for a specific listing.
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the listing
 *     responses:
 *       200:
 *         description: Review summary generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIReviewSummaryResponse'
 *       404:
 *         description: Listing not found
 *       503:
 *         description: AI review summary service temporarily unavailable
 */
router.get("/reviews/:listingId/summary", getReviewSummaryController);

/**
 * @swagger
 * /api/v1/ai/generate-description:
 *   post:
 *     summary: Generate AI listing description
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     description: Generate an AI-powered description for a listing (host only).
 *     responses:
 *       200:
 *         description: Description generated successfully
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - host access only
 *       503:
 *         description: AI description generation temporarily unavailable
 */
router.post("/generate-description", authenticate, generateDescriptionController);

/**
 * @swagger
 * /api/v1/ai/recommendations:
 *   get:
 *     summary: Get personalized AI recommendations
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     description: Get personalized listing recommendations based on user preferences and history.
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIRecommendationsResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *       503:
 *         description: AI recommendations service temporarily unavailable
 */
router.get("/recommendations", authenticate, getRecommendationsController);

export default router;
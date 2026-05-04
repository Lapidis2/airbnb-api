import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getListingReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../../controllers/reviews.controller";

const route = Router();
/**
 * @swagger
 * /api/v1/reviews/listings/{listingId}:
 *   get:
 *     summary: Get reviews for a listing
 *     tags: [Reviews]
 *     description: Retrieve all reviews for a specific listing
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Listing not found
 */
route.get("/listings/:listingId", getListingReviews);
/**
 * @swagger
 * /api/v1/reviews/listings/{listingId}:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     description: Add a review for a specific listing (authenticated users only)
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewInput'
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
route.post("/listings/:listingId", authenticate, createReview);
/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   put:
 *     summary: Update review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     description: Update a review (only owner)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReviewInput'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
route.put("/:id", authenticate, updateReview );
/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a review (only owner or admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
route.delete("/:id", authenticate, deleteReview as any);

export default route;

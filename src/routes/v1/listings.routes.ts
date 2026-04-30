import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getAllListings,
  getSingleListing,
  searchListings,
  updateListing,
  deleteListing,
  createListing,
} from "../../controllers/listings.controller";

const route = Router();
/**
 * @swagger
 * /api/v1/listings:
 *   get:
 *     summary: Get all listings
 *     tags: [Listings]
 *     description: Retrieve all available listings
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 */
route.get("/", getAllListings as any);
/**
 * @swagger
 * /api/v1/listings/search:
 *   get:
 *     summary: Search listings
 *     tags: [Listings]
 *     description: Search listings by location, price, or filters
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per night
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per night
 *     responses:
 *       200:
 *         description: Search results returned successfully
 */
route.get("/search", searchListings as any);
/**
 * @swagger
 * /api/v1/listings/{id}:
 *   get:
 *     summary: Get single listing
 *     tags: [Listings]
 *     description: Retrieve details of a specific listing
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Listing found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Listing not found
 */
route.get("/:id", getSingleListing as any);
/**
 * @swagger
 * /api/v1/listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new property listing (HOST only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingInput'
 *     responses:
 *       201:
 *         description: Listing created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 */
route.post("/", authenticate, createListing as any);
/**
 * @swagger
 * /api/v1/listings/{id}:
 *   put:
 *     summary: Update listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     description: Update an existing listing (HOST only)
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
 *             $ref: '#/components/schemas/UpdateListingInput'
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
route.put("/:id", authenticate, updateListing as any);
/**
 * @swagger
 * /api/v1/listings/{id}:
 *   delete:
 *     summary: Delete listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a listing (HOST only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
route.delete("/:id", authenticate, deleteListing as any);

export default route;

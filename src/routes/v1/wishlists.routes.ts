import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getMyWishlists,
  createWishlist,
  getWishlistById,
  deleteWishlist,
  addListingToWishlist,
  removeListingFromWishlist,
  checkListingInWishlist,
} from "../../controllers/wishlist.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/wishlists:
 *   get:
 *     summary: Get all wishlists for the authenticated user
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wishlists with item counts
 */
router.get("/", authenticate, getMyWishlists);

/**
 * @swagger
 * /api/v1/wishlists:
 *   post:
 *     summary: Create a new wishlist
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Beach Getaways"
 *     responses:
 *       201:
 *         description: Wishlist created
 */
router.post("/", authenticate, createWishlist);

/**
 * @swagger
 * /api/v1/wishlists/{wishlistId}:
 *   get:
 *     summary: Get a specific wishlist with its listings
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist with listings
 *       404:
 *         description: Wishlist not found
 */
router.get("/:wishlistId", authenticate, getWishlistById);

/**
 * @swagger
 * /api/v1/wishlists/{wishlistId}:
 *   delete:
 *     summary: Delete a wishlist
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist deleted
 */
router.delete("/:wishlistId", authenticate, deleteWishlist);

/**
 * @swagger
 * /api/v1/wishlists/{wishlistId}/items:
 *   post:
 *     summary: Add a listing to a wishlist
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [listingId]
 *             properties:
 *               listingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Listing added
 *       404:
 *         description: Wishlist or listing not found
 *       409:
 *         description: Already in wishlist
 */
router.post("/:wishlistId/items", authenticate, addListingToWishlist);

/**
 * @swagger
 * /api/v1/wishlists/{wishlistId}/items/{listingId}:
 *   delete:
 *     summary: Remove a listing from a wishlist
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing removed
 */
router.delete("/:wishlistId/items/:listingId", authenticate, removeListingFromWishlist);

/**
 * @swagger
 * /api/v1/wishlists/check:
 *   get:
 *     summary: Check which of the user's wishlists contain a specific listing
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of wishlists with saved status for the listing
 */
router.get("/check", authenticate, checkListingInWishlist);

export default router;

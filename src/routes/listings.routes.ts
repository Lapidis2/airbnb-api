import { Router } from "express";
import { createListing, deleteListing, getAllListings, getSingleListing, updateListing } from "../controllers/listings.controller";
import { authenticate, requireHost } from "../middlewares/auth.middleware";

const route = Router();
/**
 * @swagger
 * /listings:
 *   get:
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: guests
 *         schema: { type: integer }
 *     responses:
 *       200:
 */

route.get("/", getAllListings);
/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *       404:
 */

route.get("/:id", getSingleListing);
/**
 * @swagger
 * /listings:
 *   post:
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingInput'
 *     responses:
 *       201:
 *       400:
 *       401:
 */
route.post("/",authenticate,requireHost, createListing);
/**
 * @swagger
 * /listings/{id}:
 *   put:
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *       401:
 *       404:
 */
route.put("/:id", authenticate,updateListing);
/**
 * @swagger
 * /listings/{id}:
 *   delete:
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *     responses:
 *       200:
 *       401:
 *       404:
 */
route.delete("/:id", authenticate,deleteListing);

export default route;
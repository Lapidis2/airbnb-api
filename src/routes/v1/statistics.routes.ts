import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getListingsStatistics, getUserStatistics } from "../../controllers/statistics.controller";

const route = Router();

/**
 * @swagger
 * /api/v1/statistics/listings:
 *   get:
 *     summary: Get listings statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve statistics for listings (total, average price, by location, by type)
 *     responses:
 *       200:
 *         description: Listings statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalListings:
 *                   type: integer
 *                 averagePrice:
 *                   type: number
 *                 byLocation:
 *                   type: array
 *                   items:
 *                     type: object
 *                 byType:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
route.get("/listings", authenticate, getListingsStatistics as any);

/**
 * @swagger
 * /api/v1/statistics/users:
 *   get:
 *     summary: Get users statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve statistics for users (total, by role)
 *     responses:
 *       200:
 *         description: Users statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 byRole:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
route.get("/users", authenticate, getUserStatistics as any);

export default route;
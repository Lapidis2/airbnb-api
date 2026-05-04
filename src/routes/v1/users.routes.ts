import { Router } from "express";
import { validate } from "../../middlewares/validation";
import { updateUserSchema } from "../../validators/user.validator";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  getUserBookings,
} from "../../controllers/users.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { getUserStatistics } from "../../controllers/statistics.controller";

const route = Router();
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     description: Retrieve a list of all registered users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
route.get("/", getAllUsers as any);
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     description: Retrieve a single user by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
route.get("/:id", getUserById as any);
/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Update user information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
route.put("/:id", authenticate, validate(updateUserSchema), updateUser as any);
/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a user account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
route.delete("/:id", authenticate, deleteUser as any);
/**
 * @swagger
 * /api/v1/users/{id}/bookings:
 *   get:
 *     summary: Get user bookings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all bookings made by a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       404:
 *         description: User not found
 */
route.get("/:id/bookings", authenticate, getUserBookings as any);
/**
 * @swagger
 * /api/v1/users/statistics:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Returns statistics about users (total users, hosts, guests, etc.)
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalHosts:
 *                   type: number
 *                 totalGuests:
 *                   type: number
 */
route.get("/statistics", authenticate, getUserStatistics as any);

export default route;

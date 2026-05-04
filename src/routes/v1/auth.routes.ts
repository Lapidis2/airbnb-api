import { Router } from "express";
import { validate } from "../../middlewares/validation";
import { createUserSchema } from "../../validators/user.validator";
import {
  changePassword,
  resetPassword,
  forgotPassword,
  register,
  login,
} from "../../controllers/auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const route = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Create a new user account. Email and username must be unique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields or validation failed
 */
route.post(
  "/register",
  validate(createUserSchema),
  register 
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     description: Authenticate a user and return a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
  *     responses:
  *       200:
  *         description: Login successful
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
route.post("/login", login );

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     description: Send a password reset email to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: User not found
 */
route.post("/forgot-password", forgotPassword);

 /**
  * @swagger
  * /api/v1/auth/reset-password/{token}:
  *   post:
  *     summary: Reset password
  *     tags: [Auth]
  *     description: Reset password using reset token.
  *     parameters:
  *       - in: path
  *         name: token
  *         required: true
  *         schema:
  *           type: string
  *         description: Password reset token
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             required:
  *               - password
  *             properties:
  *               password:
  *                 type: string
  *                 example: NewPassword123!
  *     responses:
  *       200:
  *         description: Password reset successful
  *       400:
  *         description: Invalid or expired token
  */
route.post("/reset-password/:token", resetPassword );

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Change password for authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
route.post("/change-password", authenticate, changePassword as any);

export default route;

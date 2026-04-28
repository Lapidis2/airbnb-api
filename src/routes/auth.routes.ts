import { Router } from "express";
import { Response, Request } from "express";
import { validate } from "../middlewares/validation";
import { createUserSchema } from "../validators/user.validator";
import { changePassword,resetPassword,forgotPassword, register, login } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Jean Pierre
 *         email:
 *           type: string
 *           example: jean@gmail.com
 *         username:
 *           type: string
 *           example: jp_dev
 *         phone:
 *           type: string
 *           example: "+250788000000"
 *         role:
 *           type: string
 *           enum: [HOST, GUEST, ADMIN]
 *           example: GUEST
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: https://cdn.com/avatar.jpg
 *         avatarPublicId:
 *           type: string
 *           nullable: true
 *         bio:
 *           type: string
 *           nullable: true
 *         resetToken:
 *           type: string
 *           nullable: true
 *         resetTokenExpiry:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         password:
 *           type: string
 *           example: hashedpassword
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ListingPhoto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         url:
 *           type: string
 *           example: https://cdn.com/photo.jpg
 *         publicId:
 *           type: string
 *         isPrimary:
 *           type: boolean
 *           example: false
 *         listingId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *           example: Cozy Apartment in Kigali
 *         description:
 *           type: string
 *         location:
 *           type: string
 *           example: Kigali
 *         pricePerNight:
 *           type: number
 *           example: 50
 *         guests:
 *           type: integer
 *           example: 2
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: ["wifi", "kitchen", "parking"]
 *         rating:
 *           type: number
 *           nullable: true
 *         photos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ListingPhoto'
 *         hostId:
 *           type: integer
 *         host:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         checkIn:
 *           type: string
 *           format: date-time
 *         checkOut:
 *           type: string
 *           format: date-time
 *         totalPrice:
 *           type: number
 *           example: 200
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *         guestId:
 *           type: integer
 *         listingId:
 *           type: integer
 *         guest:
 *           $ref: '#/components/schemas/User'
 *         listing:
 *           $ref: '#/components/schemas/Listing'
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateListingInput:
 *       type: object
 *       required: [title, description, location, pricePerNight, guests, type, amenities]
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         pricePerNight:
 *           type: number
 *         guests:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *
 *     CreateBookingInput:
 *       type: object
 *       required: [listingId, guestId, checkIn, checkOut]
 *       properties:
 *         listingId:
 *           type: integer
 *         guestId:
 *           type: integer
 *         checkIn:
 *           type: string
 *           format: date-time
 *         checkOut:
 *           type: string
 *           format: date-time
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Resource not found
 */


const route = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
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
 *         description: Missing required fields
 */
route.post("/register", validate(createUserSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
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
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiJ9...
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 */
route.post("/login", login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Always returns success
 */

route.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *       400:
 */
route.post("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *       401:
 */


route.post("/change-password",authenticate, changePassword);

export default route;
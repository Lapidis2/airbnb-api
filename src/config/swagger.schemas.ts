/**
 * @swagger
 * components:
 *   schemas:
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
 *         bio:
 *           type: string
 *           nullable: true
 *         password:
 *           type: string
 *           example: hashedpassword
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ListingPhoto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         url:
 *           type: string
 *           example: https://cdn.com/photo.jpg
 *         isPrimary:
 *           type: boolean
 *         listingId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
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
 *         rating:
 *           type: number
 *           nullable: true
 *         hostId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RegisterInput:
 *       type: object
 *       required: [name, email, username, phone, password, role]
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         username:
 *           type: string
 *           example: johndoe
 *         phone:
 *           type: string
 *           example: "+250788000000"
 *         password:
 *           type: string
 *           example: securepassword123
 *         role:
 *           type: string
 *           enum: [HOST, GUEST, ADMIN]
 *           example: GUEST
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: securepassword123
 *     ForgotPasswordInput:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           example: john@example.com
 *     ResetPasswordInput:
 *       type: object
 *       required: [password]
 *       properties:
 *         password:
 *           type: string
 *           example: newpassword123
 *     ChangePasswordInput:
 *       type: object
 *       required: [oldPassword, newPassword]
 *       properties:
 *         oldPassword:
 *           type: string
 *           example: currentpassword123
 *         newPassword:
 *           type: string
 *           example: newpassword123
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
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         phone:
 *           type: string
 *         bio:
 *           type: string
 *           nullable: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Resource not found
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 */

export {};

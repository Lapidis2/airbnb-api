/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d"
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
 *           type: string
 *           format: uuid
 *         url:
 *           type: string
 *           example: https://cdn.com/photo.jpg
 *         isPrimary:
 *           type: boolean
 *         listingId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d"
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
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d"
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
 *           type: string
 *           format: uuid
 *         listingId:
 *           type: string
 *           format: uuid
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
 *       required: [currentPassword, newPassword]
 *       properties:
 *         currentPassword:
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
 *       required: [listingId, checkIn, checkOut]
 *       properties:
 *         listingId:
 *           type: string
 *           format: uuid
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
  *     AISearchInput:
  *       type: object
  *       required: [query]
  *       properties:
  *         query:
  *           type: string
  *           example: "cozy apartment in Kigali with wifi for 2 guests under $100"
  *     AISearchResponse:
  *       type: object
  *       properties:
  *         success:
  *           type: boolean
  *           example: true
  *         message:
  *           type: string
  *           example: "Search completed"
  *         filters:
  *           type: object
  *           properties:
  *             location:
  *               type: string
  *               nullable: true
  *               example: "Kigali"
  *             type:
  *               type: string
  *               enum: [APARTMENT, HOUSE, VILLA, CABIN]
  *               nullable: true
  *               example: "APARTMENT"
  *             maxPrice:
  *               type: number
  *               nullable: true
  *               example: 100
  *             guests:
  *               type: integer
  *               nullable: true
  *               example: 2
  *             amenities:
  *               type: array
  *               items:
  *                 type: string
  *               example: ["wifi", "parking"]
  *         data:
  *           type: array
  *           items:
  *             $ref: '#/components/schemas/Listing'
  *         meta:
  *           type: object
  *           properties:
  *             total:
  *               type: integer
  *               example: 12
  *             page:
  *               type: integer
  *               example: 1
  *             limit:
  *               type: integer
  *               example: 5
  *             totalPages:
  *               type: integer
  *               example: 3
  *     AIChatInput:
  *       type: object
  *       required: [message]
  *       properties:
  *         message:
  *           type: string
  *           example: "What are the best places to stay in Kigali?"
  *         conversationId:
  *           type: string
  *           example: "conv_123456"
  *     AIChatResponse:
  *       type: object
  *       properties:
  *         success:
  *           type: boolean
  *           example: true
  *         message:
  *           type: string
  *           example: "AI chat temporarily disabled"
  *     AIRecommendationsResponse:
  *       type: object
  *       properties:
  *         success:
  *           type: boolean
  *           example: true
  *         message:
  *           type: string
  *           example: "AI recommendations temporarily disabled"
  *     AIReviewSummaryResponse:
  *       type: object
  *       properties:
  *         success:
  *           type: boolean
  *           example: true
  *         message:
  *           type: string
  *           example: "AI review summary temporarily disabled"
  */

export {};

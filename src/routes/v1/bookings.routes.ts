import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getUserBookings,
  confirmBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  payBooking,
  getHostBookings,
} from "../../controllers/booking.controller";

const route = Router();
/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new booking for a listing (authenticated users only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
route.post("/", authenticate, createBooking);
/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all bookings (admin or system use)
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */
route.get("/", authenticate, getAllBookings as any);

/**
 * @swagger
 * /api/v1/bookings/host:
 *   get:
 *     summary: Get all bookings for host's listings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all bookings received for the authenticated host's listings
 *     responses:
 *       200:
 *         description: Host bookings retrieved successfully
 */
route.get("/host", authenticate, getHostBookings as any);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a specific booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 */
route.get("/:id", authenticate, getBookingById as any);
/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Update booking details (status, dates, etc.)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingInput'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Booking not found
 */
route.put("/:id", authenticate, updateBooking as any);
/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   delete:
 *     summary: Delete booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a booking (only owner or admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
route.delete("/:id", authenticate, deleteBooking as any);
/**
 * @swagger
 * /api/v1/bookings/user/{id}:
 *   get:
 *     summary: Get bookings by user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all bookings made by a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *       404:
 *         description: User not found
 */
route.get("/user/:id", authenticate, getUserBookings as any);

/**
 * @swagger
 * /api/v1/bookings/{id}/confirm:
 *   post:
 *     summary: Confirm a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Confirm a pending booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking confirmed successfully
 *       400:
 *         description: Invalid state transition
 *       404:
 *         description: Booking not found
 */
route.post("/:id/confirm", authenticate, confirmBooking as any);

/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Cancel a booking (pending or confirmed)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully!
 *       404:
 *         description: Booking not found
 */
route.post("/:id/cancel", authenticate, cancelBooking as any);

/**
 * @swagger
 * /api/v1/bookings/{id}/approve:
 *   patch:
 *     summary: Approve a booking (Host only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Approve a pending booking. Only the listing host can perform this action.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking approved successfully
 *       400:
 *         description: Booking is not in PENDING state
 *       403:
 *         description: Not authorized (only host can approve)
 *       404:
 *         description: Booking not found
 */
route.patch("/:id/approve", authenticate, approveBooking as any);

/**
 * @swagger
 * /api/v1/bookings/{id}/reject:
 *   patch:
 *     summary: Reject a booking (Host only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Reject a pending booking. Only the listing host can perform this action.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Only pending bookings can be rejected
 *       403:
 *         description: Not authorized (only host can reject)
 *       404:
 *         description: Booking not found
 */
route.patch("/:id/reject", authenticate, rejectBooking as any);

/**
 * @swagger
 * /api/v1/bookings/{id}/pay:
 *   patch:
 *     summary: Mark booking as paid
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Mark payment as successful for a confirmed booking (Guest only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Payment successful
 *       400:
 *         description: Already paid or invalid state
 *       403:
 *         description: Not authorized (only guest can pay)
 *       404:
 *         description: Booking not found
 */
route.patch("/:id/pay", authenticate, payBooking as any);

export default route;

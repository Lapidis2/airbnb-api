import {Router} from "express"
import { createBooking,deleteBooking, getAllBookings, getBookingById, updateBooking } from "../controllers/booking.controller";
import { validate } from "../middlewares/validation";
import { createBookingSchema, updateBookingSchema } from "../validators/bookings.validator";
const route=Router()



/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *       400:
 *       401:
 *       404:
 */
route.post("/",validate(createBookingSchema),createBooking)
/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 */
route.get("/",getAllBookings)
/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
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
route.get("/:id",getBookingById)
/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     summary: Update booking
 *     parameters:
 *       - in: path
 *         name: id
 *     responses:
 *       200:
 *       401:
 *       404:
 */
route.put("/:id",validate(updateBookingSchema),updateBooking)
/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     summary: Cancel booking
 *     parameters:
 *       - in: path
 *         name: id
 *     responses:
 *       200:
 *       401:
 *       404:
 */
route.delete("/:id",deleteBooking)

export default route
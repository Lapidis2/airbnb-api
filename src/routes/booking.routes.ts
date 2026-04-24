import {Router} from "express"
import { createBooking,deleteBooking, getAllBookings, getBookingById, updateBooking } from "../controllers/booking.controller";
import { validate } from "../middlewares/validation";
import { createBookingSchema, updateBookingSchema } from "../validators/bookings.validator";
const route=Router()

route.post("/",validate(createBookingSchema),createBooking)
route.get("/",getAllBookings)
route.get("/:id",getBookingById)
route.put("/:id",validate(updateBookingSchema),updateBooking)
route.delete("/:id",deleteBooking)

export default route
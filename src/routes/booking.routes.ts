import {Router} from "express"
import { createBooking,deleteBooking, getAllBookings, getBookingById, updateBooking } from "../controllers/booking.controller";
const route=Router()

route.post("/",createBooking)
route.get("/",getAllBookings)
route.get("/:id",getBookingById)
route.put("/:id",updateBooking)
route.delete("/:id",deleteBooking)

export default route
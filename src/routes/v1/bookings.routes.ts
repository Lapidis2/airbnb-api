import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getUserBookings,
} from "../../controllers/booking.controller";

const route = Router();

route.post("/", authenticate, createBooking as any);
route.get("/", authenticate, getAllBookings as any);
route.get("/:id", authenticate, getBookingById as any);
route.put("/:id", authenticate, updateBooking as any);
route.delete("/:id", authenticate, deleteBooking as any);
route.get("/user/:id", authenticate, getUserBookings as any);

export default route;

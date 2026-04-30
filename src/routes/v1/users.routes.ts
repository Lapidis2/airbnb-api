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
import { getUserStats } from "../../controllers/stats.controller";

const route = Router();

route.get("/", getAllUsers as any);
route.get("/:id", getUserById as any);
route.put("/:id", authenticate, validate(updateUserSchema), updateUser as any);
route.delete("/:id", authenticate, deleteUser as any);
route.get("/:id/bookings", authenticate, getUserBookings as any);
route.get("/stats", authenticate, getUserStats as any);

export default route;

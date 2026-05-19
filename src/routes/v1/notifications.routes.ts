import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getNotifications,
  markAsRead,
} from "../../controllers/notification.controller";

const router = Router();

router.get("/", authenticate, getNotifications);
router.patch("/:id/read", authenticate, markAsRead);

export default router;

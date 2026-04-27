import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import upload  from "../../config/multer";
import { uploadAvatar,deleteAvatar } from "../controllers/upload.controller";

const router = Router();

router.post(
  "/:id/avatar",
  authenticate,
  upload.single("image"),
  uploadAvatar
);

router.delete(
  "/:id/avatar",
  authenticate,
  deleteAvatar
);
export default router;
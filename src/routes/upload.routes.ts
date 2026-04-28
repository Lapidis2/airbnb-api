import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import upload  from "../config/multer";
import { uploadAvatar,deleteAvatar,uploadListingPhotos } from "../controllers/upload.controller";

const router = Router();


/**
 * @swagger
 * /users/{id}/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture (jpeg, png, webp — max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file format or size
 *       401:
 *         description: Unauthorized
 */
  router.post(
    "/:id/avatar",
    authenticate,
    upload.single("image"),
    uploadAvatar
  );
  /**
 * @swagger
 * /users/{id}/avatar:
 *   delete:
 *     summary: Delete user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Avatar not found
 */


router.delete(
  "/:id/avatar",
  authenticate,
  deleteAvatar
);

/**
 * @swagger
 * /users/{id}/listing-photos:
 *   post:
 *     summary: Upload listing photos
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 10 images
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Invalid files
 *       401:
 *         description: Unauthorized
 */
router.post(  
  "/:id/listing-photos",
  authenticate,
  upload.array("images", 10), 
  uploadListingPhotos
);
export default router;

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { registerPushToken, removePushToken, sendTestNotification } from "../../controllers/pushToken.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/push-tokens:
 *   post:
 *     summary: Register push notification token
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM token from device
 *     responses:
 *       200:
 *         description: Token registered successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, registerPushToken as any);

/**
 * @swagger
 * /api/v1/push-tokens:
 *   delete:
 *     summary: Remove push notification token
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM token to remove
 *     responses:
 *       200:
 *         description: Token removed successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/", authenticate, removePushToken as any);

/**
 * @swagger
 * /api/v1/push-tokens/test:
 *   post:
 *     summary: Send test notification
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test notification sent
 *       401:
 *         description: Unauthorized
 */
router.post("/test", authenticate, sendTestNotification as any);

export default router;

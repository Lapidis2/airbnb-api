import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { sendMessage, getConversations, getMessageThread, markAsRead } from "../../controllers/message.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId, content]
 *             properties:
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, sendMessage as any);

/**
 * @swagger
 * /api/v1/messages/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */
router.get("/conversations", authenticate, getConversations as any);

/**
 * @swagger
 * /api/v1/messages/thread/{partnerId}:
 *   get:
 *     summary: Get message thread with a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message thread
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/thread/:partnerId", authenticate, getMessageThread as any);

/**
 * @swagger
 * /api/v1/messages/{messageId}/read:
 *   patch:
 *     summary: Mark message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
router.patch("/:messageId/read", authenticate, markAsRead as any);

export default router;

import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";
import {
  getHostRequests,
  approveHost,
  rejectHost,
} from "../../controllers/admin.controller";

const route = Router();

/**
 * @swagger
 * /api/v1/admin/host-requests:
 *   get:
 *     summary: Get pending host requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all users with HOST role and PENDING status (Admin only)
 *     responses:
 *       200:
 *         description: Host requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
route.get("/host-requests", authenticate, requireAdmin, getHostRequests as any);

/**
 * @swagger
 * /api/v1/admin/approve-host/{id}:
 *   patch:
 *     summary: Approve host request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Approve a pending host request (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Host request approved
 *       400:
 *         description: Invalid host request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
route.patch("/approve-host/:id", authenticate, requireAdmin, approveHost as any);

/**
 * @swagger
 * /api/v1/admin/reject-host/{id}:
 *   patch:
 *     summary: Reject host request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Reject a pending host request (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Host request rejected
 *       400:
 *         description: Invalid host request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
route.patch("/reject-host/:id", authenticate, requireAdmin, rejectHost as any);

export default route;
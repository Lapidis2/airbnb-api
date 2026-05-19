import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getUserNotifications, markNotificationAsRead } from "../services/notification.service";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const notifications = await getUserNotifications(userId);
    res.json(createSuccessResponse(notifications));
  } catch (error) {
    throw new AppError("Failed to fetch notifications", 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const notificationId = req.params.id;
    await markNotificationAsRead(notificationId, userId);
    res.json(createSuccessResponse(null, "Marked as read"));
  } catch (error) {
    throw new AppError("Failed to mark notification", 500);
  }
};

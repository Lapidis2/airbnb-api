import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/prismaConfig";
import { NotificationService } from "../services/notification.service";

export const registerPushToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    const userId = req.userId as string;

    if (!token) {
      res.status(400).json({ message: "Push token is required" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingTokens = (user.pushTokens as string[]) || [];
    
    // Check if token already exists
    if (existingTokens.includes(token)) {
      res.json({ message: "Token already registered" });
      return;
    }

    // Add new token
    await prisma.user.update({
      where: { id: userId },
      data: {
        pushTokens: [...existingTokens, token],
      },
    });

    console.log(`[PUSH TOKEN] Registered token for user: ${userId}`);
    res.json({ message: "Push token registered successfully" });
  } catch (error) {
    console.error("[PUSH TOKEN] Error registering token:", error);
    res.status(500).json({ message: "Failed to register push token" });
  }
};

export const removePushToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    const userId = req.userId as string;

    if (!token) {
      res.status(400).json({ message: "Push token is required" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingTokens = (user.pushTokens as string[]) || [];
    const updatedTokens = existingTokens.filter(t => t !== token);

    await prisma.user.update({
      where: { id: userId },
      data: {
        pushTokens: updatedTokens,
      },
    });

    console.log(`[PUSH TOKEN] Removed token for user: ${userId}`);
    res.json({ message: "Push token removed successfully" });
  } catch (error) {
    console.error("[PUSH TOKEN] Error removing token:", error);
    res.status(500).json({ message: "Failed to remove push token" });
  }
};

export const sendTestNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true, name: true },
    });

    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      res.status(400).json({ message: "No push tokens registered. Register a token first." });
      return;
    }

    const success = await NotificationService.sendNotification(
      userId,
      {
        title: "Test Notification",
        body: `Hello ${user.name}! Your push notifications are working! 🎉`,
      }
    );

    if (success) {
      res.json({ 
        message: "Test notification sent successfully", 
        totalTokens: user.pushTokens.length
      });
    } else {
      res.status(400).json({ 
        message: "Failed to send notification",
        hint: "Make sure you registered a valid FCM token from a real device/browser. Use get-fcm-token.html to generate one."
      });
    }
  } catch (error) {
    console.error("[PUSH TOKEN] Error sending test notification:", error);
    res.status(500).json({ message: "Failed to send test notification" });
  }
};

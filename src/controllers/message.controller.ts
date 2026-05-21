import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/prismaConfig";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";
import { NotificationService } from "../services/notification.service";

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.userId!;

    if (!recipientId || !content) {
      throw new AppError("recipientId and content are required", 400);
    }

    if (recipientId === senderId) {
      throw new AppError("Cannot send message to yourself", 400);
    }

    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId }, select: { id: true, name: true } }),
      prisma.user.findUnique({ where: { id: recipientId }, select: { id: true, name: true } }),
    ]);

    if (!sender || !recipient) {
      throw new AppError("User not found", 404);
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        recipientId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        recipient: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json(createSuccessResponse(message, "Message sent successfully"));

    setImmediate(async () => {
      try {
        await NotificationService.sendMessageNotification(
          recipientId,
          sender.name,
          content,
          senderId
        );
      } catch (error) {
        console.error("[MESSAGE] Push notification failed:", error);
      }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to send message", 500);
  }
};

export const replyToMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const { content } = req.body;
    const senderId = req.userId!;

    if (!partnerId || !content) {
      throw new AppError("partnerId and content are required", 400);
    }

    if (partnerId === senderId) {
      throw new AppError("Cannot send message to yourself", 400);
    }

    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId }, select: { id: true, name: true } }),
      prisma.user.findUnique({ where: { id: partnerId }, select: { id: true, name: true } }),
    ]);

    if (!sender || !recipient) {
      throw new AppError("User not found", 404);
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        recipientId: partnerId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        recipient: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json(createSuccessResponse(message, "Reply sent successfully"));

    setImmediate(async () => {
      try {
        await NotificationService.sendMessageNotification(
          partnerId,
          sender.name,
          content,
          senderId
        );
      } catch (error) {
        console.error("[MESSAGE] Push notification failed:", error);
      }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to send reply", 500);
  }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        recipient: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const partner = msg.senderId === userId ? msg.recipient : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerAvatar: partner.avatar,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (msg.recipientId === userId && !msg.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(createSuccessResponse(conversations));
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to fetch conversations", 500);
  }
};

export const getMessageThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { partnerId } = req.params;

    if (!partnerId) {
      throw new AppError("partnerId is required", 400);
    }

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, avatar: true },
    });

    if (!partner) {
      throw new AppError("User not found", 404);
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        recipient: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json(createSuccessResponse({ partner, messages }));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to fetch messages", 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (message.recipientId !== userId) {
      throw new AppError("Not authorized", 403);
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.json(createSuccessResponse(null, "Message marked as read"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to mark message as read", 500);
  }
};

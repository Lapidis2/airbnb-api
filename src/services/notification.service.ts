import prisma from "../config/prismaConfig";
import { io } from "../../index"; 

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: string;
}

export const createNotification = async (input: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || "BOOKING",
    },
  });

  // Emit real-time notification
  if (io) {
    io.to(input.userId).emit("new_notification", notification);
  }

  return notification;
};

export const getUserNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { isRead: true },
  });
};

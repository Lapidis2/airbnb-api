import prisma from "../config/prismaConfig";

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

  console.log(`[NOTIFICATION] Created for user ${input.userId}: ${input.title}`);
  return notification;
};

export const emitNotification = (userId: string, notification: any) => {
  try {
    const { io } = require("../../index");
    
    if (io) {
      io.to(userId).emit("new_notification", notification);
      console.log(`[SOCKET] Emitted new_notification to user ${userId}`);
    } else {
      console.log(`[SOCKET] io not available - notification saved in DB only`);
    }
  } catch (error) {
    console.log(`[SOCKET] Failed to emit to ${userId} - notification saved in DB`);
  }
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

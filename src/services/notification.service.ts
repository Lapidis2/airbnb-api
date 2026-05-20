import admin, { getFirebaseAdmin } from "../config/firebase";
import prisma from "../config/prismaConfig";
import { io } from "../../index";

interface NotificationPayload {
  title: string;
  body: string;
  screen?: string;
  params?: Record<string, any>;
  channel?: string;
}

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: string;
}

export class NotificationService {
  private static async getUserTokens(userId: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushTokens: true },
      });

      if (!user || !user.pushTokens || user.pushTokens.length === 0) {
        console.log(`[NOTIFICATION] No tokens found for user: ${userId}`);
        return [];
      }

      return user.pushTokens as string[];
    } catch (error) {
      console.error(`[NOTIFICATION] Error fetching tokens for user ${userId}:`, error);
      return [];
    }
  }

  private static async removeInvalidToken(userId: string, token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushTokens: true },
      });

      if (user && user.pushTokens) {
        const updatedTokens = (user.pushTokens as string[]).filter(t => t !== token);
        
        await prisma.user.update({
          where: { id: userId },
          data: { pushTokens: updatedTokens },
        });

        console.log(`[NOTIFICATION] Removed invalid token for user: ${userId}`);
      }
    } catch (error) {
      console.error(`[NOTIFICATION] Error removing token:`, error);
    }
  }

  static async sendNotification(userId: string, payload: NotificationPayload): Promise<boolean> {
    const firebaseApp = getFirebaseAdmin();
    
    if (!firebaseApp) {
      console.log("[NOTIFICATION] Firebase not initialized. Skipping notification.");
      return false;
    }

    try {
      const tokens = await this.getUserTokens(userId);

      if (tokens.length === 0) {
        return false;
      }

      const messages = tokens.map(token => ({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          screen: payload.screen || "Home",
          params: JSON.stringify(payload.params || {}),
          channel: payload.channel || "default",
        },
        android: {
          priority: "high" as const,
          notification: {
            channelId: payload.channel || "default",
            sound: "default",
          },
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      }));

      const response = await admin.messaging().sendEach(messages);
      console.log(`[NOTIFICATION] Sent ${response.successCount}/${tokens.length} notifications to user ${userId}`);

      // Remove failed tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`[NOTIFICATION] Failed to send to token ${idx}:`, resp.error?.message);
          if (resp.error?.code === "messaging/invalid-registration-token" ||
              resp.error?.code === "messaging/registration-token-not-registered") {
            this.removeInvalidToken(userId, tokens[idx]!);
          }
        }
      });

      return response.successCount > 0;
    } catch (error) {
      console.error(`[NOTIFICATION] Error sending notification:`, error);
      return false;
    }
  }

  static async sendBookingConfirmation(
    guestId: string,
    bookingId: string,
    listingTitle: string,
    checkIn: string,
    checkOut: string
  ): Promise<void> {
    await this.sendNotification(guestId, {
      title: "Booking Confirmed ✓",
      body: `Your stay at ${listingTitle} is confirmed for ${checkIn} - ${checkOut}`,
      screen: "BookingDetail",
      params: { bookingId },
      channel: "bookings",
    });
  }

  static async sendHostBookingAlert(
    hostId: string,
    bookingId: string,
    guestName: string,
    listingTitle: string,
    checkIn: string,
    checkOut: string
  ): Promise<void> {
    await this.sendNotification(hostId, {
      title: "New Booking Request",
      body: `${guestName} wants to book ${listingTitle} for ${checkIn} - ${checkOut}`,
      screen: "HostBookingDetail",
      params: { bookingId },
      channel: "bookings",
    });
  }

  static async sendMessageNotification(
    recipientId: string,
    senderName: string,
    messagePreview: string,
    threadId: string
  ): Promise<void> {
    await this.sendNotification(recipientId, {
      title: `Message from ${senderName}`,
      body: messagePreview.substring(0, 100),
      screen: "MessageThread",
      params: { threadId },
      channel: "messages",
    });
  }

  static async sendReviewNotification(
    hostId: string,
    guestName: string,
    listingTitle: string,
    rating: number,
    reviewId: string
  ): Promise<void> {
    await this.sendNotification(hostId, {
      title: "New Review Received",
      body: `${guestName} left a ${rating}-star review for ${listingTitle}`,
      screen: "ReviewDetail",
      params: { reviewId },
      channel: "reviews",
    });
  }

  static async sendBookingReminder(
    guestId: string,
    bookingId: string,
    listingTitle: string,
    checkIn: string
  ): Promise<void> {
    await this.sendNotification(guestId, {
      title: "Upcoming Stay Reminder",
      body: `Your stay at ${listingTitle} starts on ${checkIn}`,
      screen: "BookingDetail",
      params: { bookingId },
      channel: "reminders",
    });
  }
}

// Database notification functions (for WebSocket real-time notifications)
export async function createNotification(data: CreateNotificationInput) {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
    },
  });
}

export function emitNotification(userId: string, notification: any) {
  if (io) {
    io.to(userId).emit("notification", notification);
  }
}

export async function getUserNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

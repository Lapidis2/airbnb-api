import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

import prisma from "../config/prismaConfig";
import {
  bookingConfirmationEmail,
  bookingRequestEmail,
  bookingApprovedEmail,
  bookingRejectedEmail,
  paymentSuccessEmail,
} from "../templates/email";
import { sendEmail } from "../utils/sendEmail";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";
import { createNotification, emitNotification } from "../services/notification.service";
import { NotificationService } from "../services/notification.service";

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, listingId, guests: guestsCount } = req.body;

    if (!checkIn || !checkOut || !listingId || guestsCount === undefined) {
      throw new AppError("checkIn, checkOut, listingId, and guests are required", 400);
    }

    if (!req.userId) {
      throw new AppError("Unauthorized: Token required", 401);
    }

    const guestsNum = Number(guestsCount);
    if (isNaN(guestsNum) || guestsNum < 1) {
      throw new AppError("Guests must be a positive number", 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new AppError("Invalid date format", 400);
    }

    if (checkOutDate <= checkInDate) {
      throw new AppError("checkOut must be after checkIn", 400);
    }

    const [user, listing] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId } }),
      prisma.listing.findUnique({ where: { id: listingId } }),
    ]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!listing) {
      throw new AppError("Listing not found", 404);
    }

    if (guestsNum > listing.guests) {
      throw new AppError(`This listing only accommodates up to ${listing.guests} guests`, 400);
    }

    // Prevent host from booking their own listing
    if (listing.hostId === req.userId) {
      throw new AppError("You cannot book your own listing", 400);
    }

    const overlap = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { not: "CANCELLED" },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (overlap) {
      throw new AppError("Listing already booked for those dates", 400);
    }

    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const totalPrice = nights * listing.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestId: req.userId,
        listingId,
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            host: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    res.status(201).json(createSuccessResponse(booking, "Booking created successfully"));

    // Notify host + send email + push notification
    setImmediate(async () => {
      try {
        const host = await prisma.user.findUnique({ where: { id: listing.hostId } });
        if (host) {
          // Real-time notification
          const notif = await createNotification({
            userId: host.id,
            title: "New Booking Request",
            message: `${user.name} wants to book ${listing.title}`,
            type: "BOOKING",
          });
          emitNotification(host.id, notif);

          // Push notification
          const formattedCheckIn = new Date(booking.checkIn).toDateString();
          const formattedCheckOut = new Date(booking.checkOut).toDateString();
          
          await NotificationService.sendHostBookingAlert(
            host.id,
            booking.id,
            user.name,
            listing.title,
            formattedCheckIn,
            formattedCheckOut
          );

          // Email
          await sendEmail(
            host.email,
            "New Booking Request",
            bookingRequestEmail(
              host.name,
              user.name,
              listing.title,
              formattedCheckIn,
              formattedCheckOut
            )
          );
        }
      } catch (error) {
        console.error("Host notification failed:", error);
      }
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to create booking", 500);
  }
};

/**
 * GET ALL BOOKINGS
 */
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        skip,
        take: limit,
        include: {
          guest: { select: { id: true, name: true, email: true } },
          listing: {
            select: {
              id: true,
              title: true,
              location: true,
              host: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count(),
    ]);

    const message = total === 0 ? "No bookings found." : undefined;

    res.status(200).json(
      createSuccessResponse(
        bookings,
        message,
        {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      )
    );
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to fetch bookings", 500);
  }
};

/**
 * GET BOOKING BY ID
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        listing: {
          include: {
            host: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    res.status(200).json(createSuccessResponse(booking));
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to fetch booking", 500);
  }
};

/**
 * UPDATE BOOKING
 */
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const { checkIn, checkOut, status } = req.body;

    let checkInDate = existing.checkIn;
    let checkOutDate = existing.checkOut;

    if (checkIn) checkInDate = new Date(checkIn);
    if (checkOut) checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      res.status(400).json({
        message: "checkOut must be after checkIn",
      });
      return;
    }

    let totalPrice = existing.totalPrice;

    if (checkIn || checkOut) {
      const listing = await prisma.listing.findUnique({
        where: { id: existing.listingId },
      });

      const nights =
        (checkOutDate.getTime() - checkInDate.getTime()) /
        (1000 * 60 * 60 * 24);

      totalPrice = nights * (listing?.pricePerNight || 0);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        ...(status && { status }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking" });
  }
};

/**
 * DELETE BOOKING
 */
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    await prisma.booking.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
}

export const confirmBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status === "CONFIRMED") {
      res.status(200).json(createSuccessResponse(booking, "Booking already confirmed"));
      return;
    }

    if (booking.status === "CANCELLED") {
      throw new AppError("Cannot confirm a cancelled booking", 400);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });

    res.status(200).json(createSuccessResponse(updated, "Booking confirmed successfully"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to confirm booking", 500);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status === "CANCELLED") {
      res.status(200).json(createSuccessResponse(booking, "Booking already cancelled"));
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.status(200).json(createSuccessResponse(updated, "Booking cancelled successfully"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to cancel booking", 500);
  }
};


export const approveBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id as string;
    const hostId = req.userId!;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, guest: true },
    });

    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.listing.hostId !== hostId) throw new AppError("Not authorized", 403);
    if (booking.status !== "PENDING") throw new AppError("Booking is not pending", 400);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    // Notify guest (real-time + push notification)
    const notification = await createNotification({
      userId: booking.guestId,
      title: "Booking Approved",
      message: `Your booking for ${booking.listing.title} has been approved.`,
      type: "BOOKING",
    });
    emitNotification(booking.guestId, notification);

    const formattedCheckIn = new Date(booking.checkIn).toDateString();
    const formattedCheckOut = new Date(booking.checkOut).toDateString();

    await NotificationService.sendBookingConfirmation(
      booking.guestId,
      booking.id,
      booking.listing.title,
      formattedCheckIn,
      formattedCheckOut
    );

    res.status(200).json(createSuccessResponse(updated, "Booking approved successfully"));

    // Send email in background
    setImmediate(async () => {
      console.log(`[EMAIL DEBUG] Approval flow started for guest: ${booking.guest.email}`);

      try {
        const formattedCheckIn = new Date(booking.checkIn).toDateString();
        const formattedCheckOut = new Date(booking.checkOut).toDateString();

        const emailHtml = bookingApprovedEmail(
          booking.guest.name,
          booking.listing.title,
          formattedCheckIn,
          formattedCheckOut,
          booking.totalPrice
        );

        await sendEmail(
          booking.guest.email,
          "Booking Approved",
          emailHtml
        );

        console.log(`[EMAIL SUCCESS] Approval email sent to ${booking.guest.email}`);
      } catch (error: any) {
        console.error("[EMAIL ERROR] Approval email failed:", error?.message);
      }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to approve booking", 500);
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id as string;
    const hostId = req.userId!;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, guest: true },
    });

    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.listing.hostId !== hostId) throw new AppError("Not authorized", 403);
    if (booking.status !== "PENDING") throw new AppError("Only pending bookings can be rejected", 400);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "REJECTED" },
    });

    const rejectNotif = await createNotification({
      userId: booking.guestId,
      title: "Booking Rejected",
      message: `Your booking for ${booking.listing.title} was rejected.`,
      type: "BOOKING",
    });
    emitNotification(booking.guestId, rejectNotif);

    res.status(200).json(createSuccessResponse(updated, "Booking rejected"));

    // Send rejection email in background
    setImmediate(async () => {
      console.log(`[EMAIL DEBUG] Rejection flow started for guest: ${booking.guest.email}`);
      console.log(`[EMAIL DEBUG] Guest name: ${booking.guest.name}`);
      console.log(`[EMAIL DEBUG] Listing title: ${booking.listing.title}`);

      try {
        const emailHtml = bookingRejectedEmail(
          booking.guest.name,
          booking.listing.title
        );

        console.log(`[EMAIL DEBUG] Sending rejection email now...`);

        await sendEmail(
          booking.guest.email,
          "Booking Request Rejected",
          emailHtml
        );

        console.log(`[EMAIL SUCCESS] Rejection email sent to ${booking.guest.email}`);
      } catch (error: any) {
        console.error("[EMAIL ERROR] Rejection email failed:");
        console.error("Error message:", error?.message);
        console.error("Full error:", error);
      }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to reject booking", 500);
  }
};

/**
 * MARK PAYMENT AS PAID
 */
export const payBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id as string;
    const userId = req.userId!;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, guest: true },
    });

    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.guestId !== userId) throw new AppError("Not authorized", 403);
    if (booking.paymentStatus === "PAID") throw new AppError("Already paid", 400);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "PAID" },
    });

    // Notify host
    const paymentNotif = await createNotification({
      userId: booking.listing.hostId,
      title: "Payment Received",
      message: `Payment received for booking of ${booking.listing.title}`,
      type: "PAYMENT",
    });
    emitNotification(booking.listing.hostId, paymentNotif);

    // Send confirmation email to guest
    await sendEmail(
      booking.guest.email,
      "Payment Successful",
      paymentSuccessEmail(booking.guest.name, booking.listing.title, booking.totalPrice)
    );

    res.status(200).json(createSuccessResponse(updated, "Payment successful"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to process payment", 500);
  }
};

/**
 * GET BOOKINGS FOR HOST (Host's listings)
 */
export const getHostBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = req.userId!;

    const bookings = await prisma.booking.findMany({
      where: {
        listing: { hostId },
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(createSuccessResponse(bookings, "Host bookings retrieved"));
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to fetch host bookings", 500);
  }
};

export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { guestId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              location: true,
              pricePerNight: true,
              host: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.booking.count({ where: { guestId: userId } }),
    ]);

    res.status(200).json({
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
};
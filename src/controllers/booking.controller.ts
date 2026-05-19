import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

import prisma from "../config/prismaConfig";
import { bookingConfirmationEmail } from "../templates/email";
import { sendEmail } from "../utils/sendEmail";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";

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

    setImmediate(async () => {
      try {
        if (user && listing) {
          const formattedCheckIn = new Date(booking.checkIn).toDateString();
          const formattedCheckOut = new Date(booking.checkOut).toDateString();

          await sendEmail(
            user.email,
            "Booking Confirmed 🎉",
            bookingConfirmationEmail(
              user.name,
              listing.title,
              listing.location,
              formattedCheckIn,
              formattedCheckOut,
              booking.totalPrice
            )
          );
        }
      } catch (error) {
        console.error("Booking email failed:", error);
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
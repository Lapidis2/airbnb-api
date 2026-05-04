import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

import prisma from "../config/prismaConfig";
import { bookingConfirmationEmail } from "../templates/email";
import { sendEmail } from "../utils/sendEmail";

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, listingId, guests: guestsCount } = req.body;

    if (!checkIn || !checkOut || !listingId || guestsCount === undefined) {
      res.status(400).json({
        message: "checkIn, checkOut, listingId, and guests are required",
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized: Token required" });
      return;
    }

    const guestsNum = Number(guestsCount);
    if (isNaN(guestsNum) || guestsNum < 1) {
      res.status(400).json({
        message: "Guests must be a positive number",
      });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    if (checkOutDate <= checkInDate) {
      res.status(400).json({
        message: "checkOut must be after checkIn",
      });
      return;
    }

    const [user, listing] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId } }),
      prisma.listing.findUnique({ where: { id: listingId } }),
    ]);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (guestsNum > listing.guests) {
      res.status(400).json({
        message: `This listing only accommodates up to ${listing.guests} guests`,
      });
      return;
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
      res.status(400).json({
        message: "Listing already booked for those dates",
      });
      return;
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
        listing: { select: { id: true, title: true, location: true } },
      },
    });

    res.status(201).json(booking);

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
    res.status(500).json({ message: "Failed to create booking" });
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
          listing: { select: { id: true, title: true, location: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count(),
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
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings" });
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
        guest: true,
        listing: true,
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch booking" });
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
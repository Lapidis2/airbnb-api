import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * CREATE BOOKING
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, guestId, listingId } = req.body;

    if (!checkIn || !checkOut || !guestId || !listingId) {
      res.status(400).json({
        message: "checkIn, checkOut, guestId, listingId required",
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

    const guest = await prisma.user.findUnique({
      where: { id: Number(guestId) },
    });

    if (!guest) {
      res.status(404).json({ message: "Guest not found" });
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: Number(listingId) },
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // prevent overlapping bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        listingId: Number(listingId),
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
        guestId: Number(guestId),
        listingId: Number(listingId),
      },
      include: {
        guest: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

/**
 * GET ALL BOOKINGS
 */
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/**
 * GET BOOKING BY ID
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

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
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

/**
 * UPDATE BOOKING
 */
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

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
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

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
};
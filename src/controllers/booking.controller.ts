import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { checkIn, checkOut, guestId, listingId } = req.body;

    
    if (!checkIn || !checkOut || !guestId || !listingId) {
      res.status(400).json({
        message: "checkIn, checkOut, guestId, and listingId are required",
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

    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const totalPrice = nights * listing.pricePerNight;


    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId: Number(listingId),
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (overlapping) {
      res.status(400).json({
        message: "Listing already booked for selected dates",
      });
      return;
    }

    
    const booking = await prisma.booking.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestId: Number(guestId),
        listingId: Number(listingId),
      },
      include: {
        guest: {
          select: { id: true, name: true },
        },
        listing: {
          select: { id: true, title: true, pricePerNight: true },
        },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      message: "Failed to create booking",
    });
  }
};
import prisma from "../../config/prismaConfig";
import { Request, Response } from "express";
export const getAllListings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany({
      include: {
        host: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({
      message: "Failed to fetch listings",
    });
  }
};

export const getSingleListing = async (req: Request, res: Response): Promise<void> => { 
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        message: "Invalid listing ID",
      });
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json({
        message: "Listing not found",
      });
      return;
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("Get single listing error:", error);
    res.status(500).json({
      message: "Failed to fetch listing",
    });
  }
}


export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      guests,
      type,
      amenities,
      hostId,
    } = req.body;

    
    if (!title || !location || !pricePerNight || !guests || !type || !hostId) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    
    const host = await prisma.user.findUnique({
      where: { id: Number(hostId) },
    });

    if (!host) {
      res.status(404).json({ message: "Host not found" });
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        location,
        pricePerNight: Number(pricePerNight),
        guests: Number(guests),
        type,
        amenities: amenities || [],
        hostId: Number(hostId),
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    console.log("Create listing error:", error);
    res.status(500).json({ message: "Failed to create listing", error });
  }
};

export const updateListing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        message: "Invalid listing ID",
      });
      return;
    }

    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      res.status(404).json({
        message: "Listing not found",
      });
      return;
    }

    const {
      title,
      description,
      location,
      pricePerNight,
      guests,
      type,
      amenities,
      rating,
      hostId,
    } = req.body;

   
    if (hostId) {
      const host = await prisma.user.findUnique({
        where: { id: Number(hostId) },
      });

      if (!host) {
        res.status(404).json({
          message: "Host not found",
        });
        return;
      }
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(pricePerNight !== undefined && {
          pricePerNight: Number(pricePerNight),
        }),
        ...(guests !== undefined && {
          guests: Number(guests),
        }),
        ...(type && { type }),
        ...(amenities && {
          amenities: Array.isArray(amenities) ? amenities : [],
        }),
        ...(rating !== undefined && {
          rating: Number(rating),
        }),
        ...(hostId && {
          hostId: Number(hostId),
        }),
      },
      include: {
        host: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({ message: "Listing updated successfully", data: updatedListing });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({
      message: "Failed to update listing",
    });
  }
};


export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existingListing = await prisma.listing.findFirst({
      where: { id },
    });

    if (!existingListing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    await prisma.listing.delete({
      where: { id },
    });

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete listing", error });
  }
};
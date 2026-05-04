import prisma from "../config/prismaConfig";
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Prisma } from "@prisma/client";
export const getAllListings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany({
      include: {
        host: true,
        photos: true,
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

export const getSingleListing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        host: true,
        photos: true,
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
};

export const searchListings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      location,
      type,
      minPrice,
      maxPrice,
      guests,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (!Number.isInteger(pageNum) || pageNum < 1) {
      res.status(400).json({ message: "Invalid page number" });
      return;
    }
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({ message: "Invalid limit" });
      return;
    }

    const skip = (pageNum - 1) * limitNum;
    const where: Prisma.ListingWhereInput = {};

    const locationValue = Array.isArray(location) ? location[0] : location;
    if (locationValue && typeof locationValue === "string" && locationValue.trim() !== "") {
      where.location = {
        contains: locationValue.trim(),
        mode: "insensitive" as Prisma.QueryMode,
      };
    }

    if (type && typeof type === "string") {
      const validTypes = ["APARTMENT", "HOUSE", "VILLA", "CABIN"];
      const normalizedType = type.toUpperCase();
      if (!validTypes.includes(normalizedType)) {
        res.status(400).json({ message: "Invalid listing type" });
        return;
      }
      where.type = normalizedType as Prisma.EnumListingTypeFilter;
    }

    const priceFilter: Prisma.FloatFilter = {};
    if (minPrice !== undefined) {
      const min = Number(minPrice as string);
      if (isNaN(min)) {
        res.status(400).json({ message: "Invalid minPrice" });
        return;
      }
      priceFilter.gte = min;
    }
    if (maxPrice !== undefined) {
      const max = Number(maxPrice as string);
      if (isNaN(max)) {
        res.status(400).json({ message: "Invalid maxPrice" });
        return;
      }
      priceFilter.lte = max;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerNight = priceFilter;
    }

    if (guests !== undefined) {
      const guestsNum = Number(guests);
      if (isNaN(guestsNum) || guestsNum < 1) {
        res.status(400).json({ message: "Invalid guests count" });
        return;
      }
      where.guests = { gte: guestsNum };
    }
console.log("WHERE FILTER:", JSON.stringify(where, null, 2));
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          host: true,
          photos: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.count({ where }),
    ]);

    res.status(200).json({
      data: listings,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Search listings error:", error);
    res.status(500).json({
      message: "Failed to search listings",
    });
  }
};

export const createListing = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      guests,
      type,
      amenities,
    } = req.body;

    
    if (!title || !location || !pricePerNight || !guests || !type) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
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
         hostId: req.userId,
       },
    });

    res.status(201).json(listing);
  } catch (error) {
    console.log("Create listing error:", error);
    res.status(500).json({ message: "Failed to create listing" });
  }
};




export const updateListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
       res.status(404).json({ message: "Listing not found" });
       return
    }
    
   if (listing.hostId !== req.userId && req.role !== "ADMIN") {
   res.status(403).json({
     message: "You can only edit your own listings",
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
    } = req.body;

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

      },
      include: {
        host: true,
        photos: true,
      },
    });

    res.status(200).json({
      message: "Listing updated successfully",
      data: updatedListing,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ message: "Failed to update listing" });
  }
};
   

     

export const deleteListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

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

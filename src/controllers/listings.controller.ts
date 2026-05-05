import prisma from "../config/prismaConfig";
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Prisma } from "@prisma/client";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";
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

    res.status(200).json(createSuccessResponse(listings));
  } catch (error) {
    console.error("Get listings error:", error);
    throw new AppError("Failed to fetch listings", 500);
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
      throw new AppError("Listing not found", 404);
    }

    res.status(200).json(createSuccessResponse(listing));
  } catch (error) {
    console.error("Get single listing error:", error);
    throw new AppError("Failed to fetch listing", 500);
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
      throw new AppError("Invalid page number", 400);
    }
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new AppError("Invalid limit", 400);
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
        throw new AppError("Invalid listing type", 400);
      }
      where.type = normalizedType as Prisma.EnumListingTypeFilter;
    }

    const priceFilter: Prisma.FloatFilter = {};
    if (minPrice !== undefined) {
      const min = Number(minPrice as string);
      if (isNaN(min)) {
        throw new AppError("Invalid minPrice", 400);
      }
      priceFilter.gte = min;
    }
    if (maxPrice !== undefined) {
      const max = Number(maxPrice as string);
      if (isNaN(max)) {
        throw new AppError("Invalid maxPrice", 400);
      }
      priceFilter.lte = max;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerNight = priceFilter;
    }

    if (guests !== undefined) {
      const guestsNum = Number(guests);
      if (isNaN(guestsNum) || guestsNum < 1) {
        throw new AppError("Invalid guests count", 400);
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

    const message = total === 0
      ? "No listings found for your search. Try adjusting location, price, or type."
      : undefined;

    res.status(200).json(
      createSuccessResponse(
        listings,
        message,
        {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        }
      )
    );
  } catch (error) {
    console.error("Search listings error:", error);
    throw new AppError("Failed to search listings", 500);
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
      throw new AppError("Missing required fields", 400);
    }

    
    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
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

    res.status(201).json(createSuccessResponse(listing, "Listing created successfully"));
  } catch (error) {
    console.log("Create listing error:", error);
    throw new AppError("Failed to create listing", 500);
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
       throw new AppError("Listing not found", 404);
    }
    
   if (listing.hostId !== req.userId && req.role !== "ADMIN") {
     throw new AppError("You can only edit your own listings", 403);
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

    res.status(200).json(createSuccessResponse(updatedListing, "Listing updated successfully"));
  } catch (error) {
    console.error("Update listing error:", error);
    throw new AppError("Failed to update listing", 500);
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
      throw new AppError("Listing not found", 404);
    }

    await prisma.listing.delete({
      where: { id },
    });

    res.status(200).json(createSuccessResponse(null, "Listing deleted successfully"));
  } catch (error) {
    console.error("Delete listing error:", error);
    throw new AppError("Failed to delete listing", 500);
  }
};

import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/prismaConfig";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";

export const getMyWishlists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = wishlists.map((w) => ({
      id: w.id,
      name: w.name,
      itemCount: w._count.items,
      createdAt: w.createdAt,
    }));

    res.json(createSuccessResponse(formatted));
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to fetch wishlists", 500);
  }
};

export const createWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      throw new AppError("Wishlist name is required", 400);
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        name: name.trim(),
        userId,
      },
    });

    res.status(201).json(createSuccessResponse(wishlist, "Wishlist created successfully"));
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("A wishlist with this name already exists", 409);
    }
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to create wishlist", 500);
  }
};

export const getWishlistById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { wishlistId } = req.params;

    const wishlist = await prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        userId,
      },
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                location: true,
                pricePerNight: true,
                rating: true,
                photos: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    const listings = wishlist.items.map((item) => ({
      ...item.listing,
      primaryPhoto: item.listing.photos[0]?.url || null,
      photos: undefined,
    }));

    res.json(
      createSuccessResponse({
        id: wishlist.id,
        name: wishlist.name,
        createdAt: wishlist.createdAt,
        listings,
      })
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to fetch wishlist", 500);
  }
};

export const deleteWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { wishlistId } = req.params;

    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, userId },
    });

    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    await prisma.wishlist.delete({
      where: { id: wishlistId },
    });

    res.json(createSuccessResponse(null, "Wishlist deleted successfully"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to delete wishlist", 500);
  }
};

export const addListingToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { wishlistId } = req.params;
    const { listingId } = req.body;

    if (!listingId) {
      throw new AppError("listingId is required", 400);
    }

    // Verify wishlist belongs to user
    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, userId },
    });

    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new AppError("Listing not found", 404);
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId,
        listingId,
      },
      include: {
        listing: {
          select: { id: true, title: true, location: true },
        },
      },
    });

    res.status(201).json(createSuccessResponse(item, "Listing added to wishlist"));
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("Listing already in this wishlist", 409);
    }
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to add listing to wishlist", 500);
  }
};

export const removeListingFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { wishlistId, listingId } = req.params;

    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, userId },
    });

    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId,
        listingId,
      },
    });

    res.json(createSuccessResponse(null, "Listing removed from wishlist"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to remove listing from wishlist", 500);
  }
};

export const checkListingInWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { listingId } = req.query;

    if (!listingId || typeof listingId !== "string") {
      throw new AppError("listingId query parameter is required", 400);
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        items: {
          where: { listingId },
          select: { id: true },
        },
      },
    });

    const result = wishlists.map((w) => ({
      wishlistId: w.id,
      name: w.name,
      isSaved: w.items.length > 0,
    }));

    res.json(createSuccessResponse(result));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError("Failed to check wishlist status", 500);
  }
};

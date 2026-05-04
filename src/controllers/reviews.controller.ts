import { Request, Response } from "express";
import prisma from "../config/prismaConfig";
import { getCache, setCache, clearCache } from "../config/cache";
import { AuthRequest } from "../middlewares/auth.middleware";
import { invalidateReviewSummaryCache } from "../services/ai/review-summary.service";

const REVIEWS_CACHE_KEY = (listingId: string | number) => `reviews:listing:${listingId}`;


export const getListingReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const listingId = req.params.listingId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `${REVIEWS_CACHE_KEY(listingId)}:page:${page}:limit:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    const listingExists = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listingExists) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { listingId } }),
    ]);

    const response = {
      Reviews: reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
        isEmpty: reviews.length === 0,
  message:
    reviews.length === 0
      ? "No reviews for this listing yet.Creat your first review."
      : "Reviews fetched successfully",
    };

    setCache(cacheKey, response, 30);
    res.status(200).json(response);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};


export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const listingId = req.params.listingId as string;
    const userId = req.userId;

    if (!rating || !comment) {
      res.status(400).json({ message: "Rating and comment are required" });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        guestId: userId,
        status: "CONFIRMED",
        checkOut: { lt: new Date() },
      },
    });
    if (!existingBooking) {
      res.status(400).json({
        message: "You must have a confirmed booking to leave a review",
      });
      return;
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId: userId,
        listingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

     clearCache(`reviews:listing:${listingId}`);
     invalidateReviewSummaryCache(listingId);

    const averageRating = await prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
    });

    if (averageRating._avg.rating !== null && averageRating._avg.rating !== undefined) {
      await prisma.listing.update({
        where: { id: listingId },
        data: { rating: averageRating._avg.rating },
      });
    }

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
};


export const updateReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { rating, comment } = req.body;
    const userId = req.userId;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    if (review.userId !== userId) {
      res.status(403).json({ message: "You cannot update this review" });
      return;
    }

  
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ?? review.rating,
        comment: comment ?? review.comment,
      },
    });

   
    clearCache(`reviews:listing:${review.listingId}`);
    invalidateReviewSummaryCache(review.listingId);

    const averageRating = await prisma.review.aggregate({
      where: { listingId: review.listingId },
      _avg: { rating: true },
    });

    await prisma.listing.update({
      where: { id: review.listingId },
      data: {
        rating: averageRating._avg.rating ?? null,
      },
    });

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
};



export const deleteReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const review = await prisma.review.findUnique({
      where: { id },
    });
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    await prisma.review.delete({
      where: { id },
    });

     clearCache(`reviews:listing:${review.listingId}`);
     invalidateReviewSummaryCache(review.listingId);

    const averageRating = await prisma.review.aggregate({
      where: { listingId: review.listingId },
      _avg: { rating: true },
    });

    if (averageRating._avg.rating !== null && averageRating._avg.rating !== undefined) {
      await prisma.listing.update({
        where: { id: review.listingId },
        data: { rating: averageRating._avg.rating },
      });
    } else {
      await prisma.listing.update({
        where: { id: review.listingId },
        data: { rating: null },
      });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};



import { Request, Response } from "express";
import prisma from "../config/prismaConfig";
import { getCache, setCache, clearCache } from "../config/cache";

const STATS_CACHE_KEY = "stats";

export const getListingsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = `${STATS_CACHE_KEY}:listings`;
    const cached = getCache(cacheKey);

    if (cached) {
      res.status(200).json(cached);
      return;
    }

    const [totalListings, averagePriceResult, byLocation, byType] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.aggregate({
        _avg: { pricePerNight: true },
      }),
      prisma.listing.groupBy({
        by: ["location"],
        _count: { location: true },
      }),
      prisma.listing.groupBy({
        by: ["type"],
        _count: { type: true },
      }),
    ]);

    const result = {
      totalListings,
      averagePrice: averagePriceResult._avg.pricePerNight || 0,
      byLocation,
      byType,
    };

    setCache(cacheKey, result, 300);
    res.status(200).json(result);
  } catch (error) {
    console.error("Get listings stats error:", error);
    res.status(500).json({ message: "Failed to fetch listings statistics" });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = `${STATS_CACHE_KEY}:users`;
    const cached = getCache(cacheKey);

    if (cached) {
      res.status(200).json(cached);
      return;
    }

    const [totalUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
    ]);

    const result = {
      totalUsers,
      byRole,
    };

    setCache(cacheKey, result, 300);
    res.status(200).json(result);
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Failed to fetch user statistics" });
  }
};

export const clearStatsCache = (): void => {
  clearCache(`${STATS_CACHE_KEY}:listings`);
  clearCache(`${STATS_CACHE_KEY}:users`);
};

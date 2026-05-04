import { Request, Response } from "express";
import prisma from "../config/prismaConfig";
import { getCache, setCache, clearCache } from "../config/cache";

const STATISTICS_CACHE_KEY = "statistics";

export const getListingsStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = `${STATISTICS_CACHE_KEY}:listings`;
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
    console.error("Get listings statistics error:", error);
    res.status(500).json({ message: "Failed to fetch listings statistics" });
  }
};

export const getUserStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = `${STATISTICS_CACHE_KEY}:users`;
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
    console.error("Get user statistics error:", error);
    res.status(500).json({ message: "Failed to fetch user statistics" });
  }
};

export const clearStatisticsCache = (): void => {
  clearCache(`${STATISTICS_CACHE_KEY}:listings`);
  clearCache(`${STATISTICS_CACHE_KEY}:users`);
};
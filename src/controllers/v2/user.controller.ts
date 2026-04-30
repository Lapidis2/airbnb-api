import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../config/prismaConfig";
import { Role } from "@prisma/client";

interface V2Response<T> {
  success: boolean;
  version: string;
  data: T;
  meta: { timestamp: string; };
}

function createV2Response<T>(data: T, success = true): V2Response<T> {
  return { success, version: "v2", data, meta: { timestamp: new Date().toISOString() } };
}

export const getAllUsersV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const role = req.query.role as Role | undefined;
    const where: Prisma.UserWhereInput = {};
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
    if (role) where.role = role;
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, username: true, phone: true, role: true,
          avatar: true, bio: true, createdAt: true, updatedAt: true } }),
      prisma.user.count({ where }),
    ]);
    res.status(200).json(createV2Response({
      items: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 },
    }));
  } catch (error) {
    console.error("Get all users v2 error:", error);
    res.status(500).json(createV2Response({ error: "Failed to fetch users" }, false));
  }
};

export const getUserByIdV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const pid = req.params.id;
    const id = Array.isArray(pid) ? pid[0] : pid;
    if (!id) {
      res.status(400).json(createV2Response({ error: "User ID is required" }, false));
      return;
    }
    const includeOptions: any = { _count: {
        select: { listings: true, bookings: true, reviews: true },
      }};
    const ib = req.query.includeBookings;
    if (ib) {
      const v = Array.isArray(ib) ? ib[0] : ib;
      if (v === "true") {
        includeOptions.bookings = { include: { listing: {
            select: { id: true, title: true, location: true, pricePerNight: true },
          }}, orderBy: { createdAt: "desc" } };
      }
    }
    const il = req.query.includeListings;
    if (il) {
      const v = Array.isArray(il) ? il[0] : il;
      if (v === "true") {
        includeOptions.listings = { include: {
            _count: { select: { reviews: true } },
          }, orderBy: { createdAt: "desc" } };
      }
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: includeOptions,
    });
    if (!user) {
      res.status(404).json(createV2Response({ error: "User not found" }, false));
      return;
    }
    res.status(200).json(createV2Response({ user }));
  } catch (error) {
    console.error("Get user by id v2 error:", error);
    res.status(500).json(createV2Response({ error: "Failed to fetch user" }, false));
  }
};

export const getUserStatsV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);
    res.status(200).json(createV2Response({
      totalUsers,
      byRole: byRole.map((r) => ({ role: r.role, count: r._count.role })),
    }));
  } catch (error) {
    console.error("Get user stats v2 error:", error);
    res.status(500).json(createV2Response({ error: "Failed to fetch user statistics" }, false));
  }
};

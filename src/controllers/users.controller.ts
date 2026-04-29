import { Request, Response } from "express";
import prisma from "../config/prismaConfig";
import { Prisma, Role } from "@prisma/client";
export const getAllUsers = async (req: Request, res: Response) => {
  try {
  
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

 
    const search = req.query.search as string | undefined;
    const role = req.query.role as Role | undefined;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }


    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc", 
        },
        include: {
          _count: {
            select: { listings: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

  
    res.status(200).json({
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        listings: true,
        bookings: true
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: req.body.name ?? undefined,
        email: req.body.email ?? undefined,
        username: req.body.username ?? undefined,
        role: req.body.role ?? undefined,
        phone: req.body.phone ?? undefined
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {  
  try {
    const userId = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};

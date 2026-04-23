import { Request, Response } from "express";
import prisma from "../../config/prismaConfig";
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ message: "Something went wrong" });
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
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email,username,role,phone } = req.body;

    if (!name || !email || !username || !role || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email,username } });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        role,
        phone
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
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
  createUser,
  updateUser,
  deleteUser
};

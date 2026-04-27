import { Request, Response } from "express";
import prisma from "../../config/prismaConfig";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service";

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "airbnb/avatars"
    );

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatar: result.url,
        avatarPublicId: result.publicId,
      },
    });

    const { password, ...safeUser } = updatedUser;

    return res.json({
      message: "Avatar uploaded successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", JSON.stringify(error, null, 2));
    return res.status(500).json({ message: "Internal server error", error: JSON.stringify(error) });
  }
};


export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

   
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    if (!user.avatar || !user.avatarPublicId) {
      return res.status(400).json({
        message: "No avatar to remove",
      });
    }

    await deleteFromCloudinary(user.avatarPublicId);

    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatar: null,
        avatarPublicId: null,
      },
    });

    return res.json({
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("Delete avatar error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
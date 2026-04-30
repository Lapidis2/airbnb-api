import { Request, Response } from "express";
import prisma from "../config/prismaConfig";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;

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
    const userId = req.params.id as string;

   
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

export const uploadListingPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const listingId = req.params.id as string;
    console.log("[uploadListingPhotos] listingId:", listingId, "userId:", req.userId, "files count:", req.files ? (req.files as Express.Multer.File[]).length : 0);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    console.log("[uploadListingPhotos] listing found:", listing ? listing.id : "NOT FOUND");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    console.log("[uploadListingPhotos] ownership check - hostId:", listing.hostId, "userId:", req.userId);
    if (listing.hostId !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const existingCount = await prisma.listingPhoto.count({
      where: { listingId },
    });
    console.log("[uploadListingPhotos] existing photos:", existingCount);

    if (existingCount >= 5) {
      return res.status(400).json({
        message: "Maximum of 5 photos allowed",
      });
    }

    const remainingSlots = 5 - existingCount;

    const filesToUpload = (req.files as Express.Multer.File[]).slice(0, remainingSlots);

    const uploadedPhotos = [];

    for (const file of filesToUpload) {
      console.log("[uploadListingPhotos] uploading file:", file.originalname, "size:", file.size);
      const result = await uploadToCloudinary(
        file.buffer,
        "airbnb/listings"
      );
      console.log("[uploadListingPhotos] Cloudinary result:", result);

      const photo = await prisma.listingPhoto.create({
        data: {
          url: result.url as string,
          publicId: result.publicId as string,
          listingId,
        },
      });
      console.log("[uploadListingPhotos] saved to DB:", photo.id);

      uploadedPhotos.push(photo);
    }

    return res.json({
      message: "Photos uploaded successfully",
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error("Upload listing photos error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteListingPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const listingId = req.params.id as string;
    const photoId = req.params.photoId as string;

    const photo = await prisma.listingPhoto.findUnique({
      where: { id: photoId },
      include: { listing: true },
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    if (photo.listingId !== listingId) {
      return res.status(400).json({ message: "Photo does not belong to this listing" });
    }

    if (photo.listing.hostId !== req.userId && req.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await deleteFromCloudinary(photo.publicId);

    await prisma.listingPhoto.delete({
      where: { id: photoId },
    });

    return res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Delete listing photo error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

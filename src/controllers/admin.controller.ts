import { Request, Response } from "express";
import prisma from "../config/prismaConfig";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";

export const getHostRequests = async (req: AuthRequest, res: Response) => {
  try {
    const hostRequests = await prisma.user.findMany({
      where: {
        role: "HOST",
        hostStatus: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true,
      },
    });

    res.status(200).json(createSuccessResponse(hostRequests));
  } catch (error) {
    console.error("Get host requests error:", error);
    throw new AppError("Failed to fetch host requests", 500);
  }
};

export const approveHost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.role !== "HOST" || user.hostStatus !== "PENDING") {
      throw new AppError("Invalid host request", 400);
    }

    await prisma.user.update({
      where: { id },
      data: { hostStatus: "APPROVED" },
    });

    res.status(200).json(createSuccessResponse(null, "Host request approved"));
  } catch (error) {
    console.error("Approve host error:", error);
    throw new AppError("Failed to approve host", 500);
  }
};

export const rejectHost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.role !== "HOST" || user.hostStatus !== "PENDING") {
      throw new AppError("Invalid host request", 400);
    }

    await prisma.user.update({
      where: { id },
      data: { hostStatus: "REJECTED" },
    });

    res.status(200).json(createSuccessResponse(null, "Host request rejected"));
  } catch (error) {
    console.error("Reject host error:", error);
    throw new AppError("Failed to reject host", 500);
  }
};
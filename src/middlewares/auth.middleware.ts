import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import prisma from "../config/prismaConfig";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
  hostStatus?: string | null;
  body: any;
  params: any;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;
}
interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
 const header = req.headers.authorization;

if (!header || !header.startsWith("Bearer ")) {
  throw new AppError("No token provided", 401);
}

const token = header.split(" ")[1];

if (!token) {
  throw new AppError("Invalid token format", 401);
}


  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = decoded.userId;
    req.role = decoded.role;

    // Fetch user to get hostStatus
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { hostStatus: true },
    });

    req.hostStatus = user?.hostStatus || null;

    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
};

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "ADMIN") return next();
  if (req.role === "HOST" && (req.hostStatus === "APPROVED" || req.hostStatus === null)) return next();
  if (req.role === "HOST" && req.hostStatus === "PENDING") {
    throw new AppError("Your host request is pending admin approval", 403);
  }
  if (req.role === "HOST" && req.hostStatus === "REJECTED") {
    throw new AppError("Your host request has been rejected", 403);
  }
  throw new AppError("Host access required", 403);
};

export const requireGuest = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "GUEST" || req.role === "ADMIN") return next();
  throw new AppError("Guest access required", 403);
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "ADMIN") return next();
  throw new AppError("Admin access required", 403);
};


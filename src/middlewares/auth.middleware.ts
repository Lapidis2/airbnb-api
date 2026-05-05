import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
  body: any;
  params: any;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;
}
interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = (
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

    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
};

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "HOST" || req.role === "ADMIN") return next();
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


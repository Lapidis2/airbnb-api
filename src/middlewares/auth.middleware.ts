import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: number;
  role?: string;
  body: any;
  params: any;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}
interface JwtPayload {
  userId: number;
  role: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
 const header = req.headers.authorization;

if (!header || !header.startsWith("Bearer ")) {
  return res.status(401).json({ message: "No token provided" });
}

const token = header.split(" ")[1];

if (!token) {
  return res.status(401).json({ message: "Invalid token format" });
}


  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "HOST" || req.role === "ADMIN") return next();
  return res.status(403).json({ message: "Host only is allowed" });
};

export const requireGuest = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "GUEST" || req.role === "ADMIN") return next();
  return res.status(403).json({ message: "Guest only is allowed" });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "ADMIN") return next();
  return res.status(403).json({ message: "Admin only" });
};


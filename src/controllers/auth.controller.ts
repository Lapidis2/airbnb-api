
import { Request, Response } from "express";
import bcrypt  from "bcrypt";
import prisma from "../config/prismaConfig";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware";
import  crypto from "crypto";
import { sendEmail } from "../utils/sendEmail";
import { passwordResetEmail, welcomeEmail } from "../templates/email";
import { clearCache } from "../config/cache";
import { token } from "morgan";
import { createSuccessResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";

const clearUserStatsCache = (): void => {
  clearCache("statistics:users");
};

const JWT_SECRET = process.env.JWT_SECRET || "hitayezurusecret";
const JWT_EXPIRES_IN = "1h";
export const register = async (req: Request, res: Response) => {
 try {
   const { name, email, username, password, role, phone } = req.body;

  if (!name || !email || !username || !password || !phone) {
    throw new AppError("Missing required fields", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      { email: email },
      { username: username },
    ],
  },
});

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

   const hashedpassword = await bcrypt.hash(password, 10);

   const userRole = role === "HOST" ? "HOST" : role === "GUEST" ? "GUEST" : "ADMIN";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedpassword,
        role: userRole,
        hostStatus: userRole === "HOST" ? "PENDING" : null,
        phone,
      },
    });

   clearUserStatsCache();

 const { password:_, ...safeUser } = user;

 res.status(201).json(createSuccessResponse(safeUser, "User registered successfully"));

  setImmediate(async () => {
    try {
      await sendEmail(
        user.email,
        "Welcome to Airbnb Clone",
        welcomeEmail(user.name, user.role)
      );
    } catch (err) {
      console.error("Welcome email failed:", err);
    }
  });
  
  } catch (error) {
   console.error("Error during registration:", error);
   throw new AppError("Internal server error", 500);
 }
};




export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  if (!user.password) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

 

  res.status(200).json(createSuccessResponse({ token, user }, "Login successful"));
  } catch (error) {
    console.error("Error during login:", error);
    throw new AppError("Internal server error", 500);
  }
};


export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!req.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) throw new AppError("User not found", 404);

  const match = await bcrypt.compare(currentPassword, user.password);

  if (!match) {
    throw new AppError("Wrong password", 401);
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  res.status(200).json(createSuccessResponse(null, "Password changed successfully. You can now login with new password"));
};






export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(200).json(createSuccessResponse(null, "If that email exists, reset link has been sent"));
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetLink = `${'http://localhost:3000'}/auth/reset-password/${rawToken}`;

  console.log("Attempting to send reset email to:", user.email);
  setImmediate(async () => {
    try {
      await sendEmail(
        user.email,
        "Reset Password",
        passwordResetEmail(user.name, resetLink,rawToken)
      );
      console.log("Reset email sent successfully to:", user.email);
    } catch (err) {
      console.error("Reset email failed:", err);
    }
  });

  return res.status(200).json(createSuccessResponse(null, "Reset link with token has been sent"));
};


export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!token || Array.isArray(token)) {
    throw new AppError("Invalid token", 400);
  }


  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashed,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  const newHashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newHashed,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.status(200).json(createSuccessResponse(null, "Password reset successful"));
};
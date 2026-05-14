
import { Request, Response } from "express";
import bcrypt  from "bcrypt";
import prisma from "../config/prismaConfig";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware";
import  crypto from "crypto";
import { sendEmail } from "../utils/sendEmail";
import { passwordResetEmail, welcomeEmail } from "../templates/email";
import { clearCache } from "../config/cache";

const clearUserStatsCache = (): void => {
  clearCache("statistics:users");
};

const JWT_SECRET = process.env.JWT_SECRET || "hitayezurusecret";
const JWT_EXPIRES_IN = "1h";
export const register = async (req: Request, res: Response) => {
 try {
   const { name, email, username, password, role, phone } = req.body;

  if (!name || !email || !username || !password || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
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
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedpassword = await bcrypt.hash(password, 10);

   const user = await prisma.user.create({
     data: {
       name,
       email,
       username,
       password: hashedpassword,
       role: role === "HOST" ? "HOST" : "GUEST",
       phone,
     },
   });

   clearUserStatsCache();

 const { password:_, ...safeUser } = user;

res.status(201).json(safeUser);

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
  res.status(500).json({ message: "Internal server error" });
 }
};




export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...safeUser } = user;

    res.status(200).json({ token, user: safeUser });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    res.json({ message: "Password updated" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing in environment variables");
      return res.status(500).json({ 
        message: "Email service not configured. Please contact administrator." 
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({
        message: "If that email exists, reset link has been sent",
      });
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

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${rawToken}`;



    setImmediate(async () => {
      try {
        await sendEmail(
          user.email,
          "Password Reset Request",
          passwordResetEmail(user.name, resetLink, rawToken)
        );
        console.log(`[FORGOT PASSWORD] Email sent successfully to: ${user.email}`);
      } catch (err) {
        console.error(`[FORGOT PASSWORD] Email failed for ${user.email}:`, err);
      }
    });

    return res.json({
      message: "If that email exists, reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || Array.isArray(token)) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashed,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
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

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
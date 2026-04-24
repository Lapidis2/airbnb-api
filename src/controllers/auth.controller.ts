
import { Request, Response } from "express";
import bcrypt  from "bcrypt";
import prisma from "../../config/prismaConfig";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hitayezurusecret";
const JWT_EXPIRES_IN = "1h";
export const register = async (req: Request, res: Response) => {
 try {
   const { name, email, username, password, role, phone } = req.body;
console.log(req.body);
  if (!name || !email || !username || !password || !phone) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password too short" });
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

 

  res.status(201).json(user);
  
 } catch (error) {
  console.error("Error during registration:", error);
  res.status(500).json({ message: "Internal server error" });
 }
};




export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

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

 

  res.json({ token, user });
  } catch (error) 
  
  {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
import type { Request, Response } from "express";
import { users, type User } from "../models/users.model.js";

export const getAllUsers = (_req: Request, res: Response): void => {
  res.json(users);
};

export const getUserById = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
};

export const createUser = (req: Request, res: Response): void => {
  const { name, email, username, phone, role, avatar, bio } = req.body as Partial<User>;

  if (!name || !email || !username || !phone || !role) {
    res.status(400).json({ message: "Missing required fields.please fill out all required fields" });
    return;
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    username,
    phone,
    role,
    avatar,
    bio
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

export const updateUser = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    res.status(404).json({ message: "User with that id not found" });
    return;
  }

  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
};

export const deleteUser = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const singleUser = users.findIndex(u => u.id === id);

  if (singleUser === -1) {
    res.status(404).json({ message: "User with that id not found" });
    return;
  }

  users.splice(singleUser, 1);
  res.json({ message: "User deleted successfully" });
};
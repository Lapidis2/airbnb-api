import fs from "fs";
import path from "path";
import type { User } from "../src/models/users.model";

const filePath = path.join(__dirname, "../../data/users.json");

// read users
export const readUsers = (): User[] => {
  if (!fs.existsSync(filePath)) return [];

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

// write users
export const writeUsers = (users: User[]) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));}
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/users.controller";

const route = Router();

route.get("/", getAllUsers);
route.get("/:id", getUserById);
route.post("/", createUser);
route.put("/:id", updateUser);
route.delete("/:id", deleteUser);

export default route;
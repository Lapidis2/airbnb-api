import { Router } from "express";
import { validate } from "../middlewares/validation";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/users.controller";
import createUserSchema from "../validators/user.validator";

const route = Router();

route.get("/", getAllUsers);
route.get("/:id", getUserById);
route.post("/", validate(createUserSchema), createUser);
route.put("/:id", validate(createUserSchema), updateUser);
route.delete("/:id", deleteUser);

export default route;
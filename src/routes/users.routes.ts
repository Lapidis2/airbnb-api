import { Router } from "express";
import { validate } from "../middlewares/validation";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/users.controller";
  import {createUserSchema, updateUserSchema} from "../validators/user.validator";

const route = Router();

route.get("/", getAllUsers);
route.get("/:id", getUserById);
route.post("/", validate(createUserSchema), createUser);
route.put("/:id", validate(updateUserSchema), updateUser);
route.delete("/:id", deleteUser);

export default route;
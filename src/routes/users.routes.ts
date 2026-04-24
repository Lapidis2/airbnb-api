import { Router } from "express";
import { validate } from "../middlewares/validation";
import { login, register } from "../controllers/auth.controller";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/users.controller";
  import {createUserSchema, updateUserSchema} from "../validators/user.validator";


const route = Router();

route.get("/", getAllUsers);
route.get("/:id", getUserById);
route.post("/login", login);
route.post("/register", validate(createUserSchema), register);
route.put("/:id", validate(updateUserSchema), updateUser);
route.delete("/:id", deleteUser);

export default route;
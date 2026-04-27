import { Router } from "express";
import { Response, Request } from "express";
import { validate } from "../middlewares/validation";
import { createUserSchema } from "../validators/user.validator";
import { changePassword,resetPassword,forgotPassword, register, login } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const route = Router();
route.get("/", (_req:Request, res:Response) => {
  console.log("AUTH ROUTE HIT");
  res.json({ message: "Auth route works" });
});
route.post("/register", validate(createUserSchema), register);
route.post("/login", login);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password/:token", resetPassword);


route.post("/change-password",authenticate, changePassword);

export default route;
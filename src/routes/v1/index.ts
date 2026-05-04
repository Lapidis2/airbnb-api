import { Router } from "express";
import authRouter from "./auth.routes.js";
import usersRouter from "./users.routes.js";
import listingsRouter from "./listings.routes.js";
import bookingsRouter from "./bookings.routes.js";
import reviewsRouter from "./reviews.routes.js";
import aiRouter from "./ai.routes.js";
import statisticsRouter from "./statistics.routes.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/listings", listingsRouter);
v1Router.use("/bookings", bookingsRouter);
v1Router.use("/reviews", reviewsRouter);
v1Router.use("/ai", aiRouter);
v1Router.use("/statistics", statisticsRouter);

export default v1Router;

import { Router } from "express";
import authRouter from "./auth.routes.js";
import usersRouter from "./users.routes.js";
import listingsRouter from "./listings.routes.js";
import bookingsRouter from "./bookings.routes.js";
import reviewsRouter from "./reviews.routes.js";
import aiRouter from "./ai.routes.js";
import notificationsRouter from "./notifications.routes.js";
import statisticsRouter from "./statistics.routes.js";
import adminRouter from "./admin.routes.js";
import pushTokenRouter from "./pushToken.routes.js";
import messageRouter from "./message.routes.js";
import wishlistRouter from "./wishlists.routes.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/listings", listingsRouter);
v1Router.use("/bookings", bookingsRouter);
v1Router.use("/reviews", reviewsRouter);
v1Router.use("/ai", aiRouter);
v1Router.use("/statistics", statisticsRouter);
v1Router.use("/admin", adminRouter);
v1Router.use("/notifications", notificationsRouter);
v1Router.use("/push-tokens", pushTokenRouter);
v1Router.use("/messages", messageRouter);
v1Router.use("/wishlists", wishlistRouter);

export default v1Router;

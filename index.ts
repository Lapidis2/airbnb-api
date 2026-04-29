import "dotenv/config";
import express, { NextFunction } from "express";
import { Request, Response } from "express";
import compression from "compression";
import userRoutes from "./src/routes/users.routes";
import listingRoutes from "./src/routes/listings.routes";
import { connectDB } from "./src/config/prismaConfig";
import bookingRoutes from "./src/routes/booking.routes";
import authRoutes from "./src/routes/auth.routes";
import uploadRoutes from "./src/routes/upload.routes";
import reviewRoutes from "./src/routes/reviews.routes";
import { setupSwagger } from "./src/config/swagger";
import { generalLimiter, strictLimiter } from "./src/middlewares/rateLimiter";

const app = express();

app.use(compression());

app.use(express.json());

app.use(generalLimiter);

const applyStrictToPost = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST") {
    return strictLimiter(req, res, next);
  } else {
    next();
  }
};

app.use("/auth", applyStrictToPost, authRoutes);
app.use("/listings", applyStrictToPost, listingRoutes);
app.use("/listings", reviewRoutes);
app.use("/bookings", applyStrictToPost, bookingRoutes);
app.use("/users", userRoutes);
app.use("/users", uploadRoutes);

setupSwagger(app);

const PORT = process.env.PORT || 5000;
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the Airbnb API!");
});

const main = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main();

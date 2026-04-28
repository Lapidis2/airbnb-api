import "dotenv/config";
import express from "express";
import { Request, Response } from "express";
import userRoutes from "./src/routes/users.routes";
import listingRoutes from "./src/routes/listings.routes";
import { connectDB } from "./src/config/prismaConfig";
import bookingRoutes from "./src/routes/booking.routes";
 import authRoutes from "./src/routes/auth.routes";
 import uploadRoutes from "./src/routes/upload.routes";
import reviewRoutes from "./src/routes/reviews.routes";
import { setupSwagger } from "./src/config/swagger";
const app = express();

app.use(express.json());
setupSwagger(app);
app.use("/users", userRoutes);
app.use("/users", uploadRoutes);
app.use("/listings", listingRoutes);
app.use("/listings", reviewRoutes);
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);

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
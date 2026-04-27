import "dotenv/config";
import express from "express";
import userRoutes from "./src/routes/users.routes";
import listingRoutes from "./src/routes/listings.routes";
import { connectDB } from "./config/prismaConfig";
import bookingRoutes from "./src/routes/booking.routes";
 import authRoutes from "./src/routes/auth.routes";
 import uploadRoutes from "./src/routes/upload.routes";
const app = express();


app.use(express.json());

app.use("/users", userRoutes);
app.use("/users", uploadRoutes);
app.use("/auth", authRoutes);
app.use("/listings", listingRoutes);
app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;

const main = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main();
import "dotenv/config";
import express from "express";
import userRoutes from "./src/routes/users.routes";
import listingRoutes from "./src/routes/listings.routes";
import { connectDB } from "./config/prismaConfig";
const app = express();


app.use(express.json());


app.use("/users", userRoutes);
app.use("/listings", listingRoutes);

const PORT = process.env.PORT || 5000;

const main = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main();
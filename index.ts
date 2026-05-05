import "dotenv/config";
import express, { NextFunction } from "express";
import { Request, Response } from "express";
import compression from "compression";
import morgan from "morgan";
import v1Router from "./src/routes/v1/index.js";
import v2UserRouter from "./src/routes/v2/user.routes.js";
import uploadRouter from "./src/routes/v1/upload.routes.js";
import reviewsRouter from "./src/routes/v1/reviews.routes.js";
import { connectDB } from "./src/config/prismaConfig";
import { setupSwagger } from "./src/config/swagger.js";
import cors from "cors";
import { errorHandler } from "./src/middlewares/error.middleware.js";
import { AppError } from "./src/errors/AppError.js";
const app = express();
app.use(cors());
app.use(
  process.env["NODE_ENV"] === "production"
    ? morgan("combined")
    : morgan("dev")
);

app.use(compression());
app.use(express.json());


app.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    uptime: process.uptime(), 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development"
  });
});


app.use("/api/v1", v1Router);

app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v2/users", v2UserRouter);

app.use("/users", uploadRouter);


setupSwagger(app);

const PORT = Number(process.env["PORT"]) || 3000;


app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Airbnb API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      apiV1: "/api/v1",
      apiV2: "/api/v2/users",
      docs: "/api-docs"
    }
  });
});

// Handle service worker requests gracefully
app.get("/sw.js", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Service worker not found" });
});

app.use((req: Request, res: Response) => {
  throw new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
});

app.use(errorHandler);

const main = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
};

main();

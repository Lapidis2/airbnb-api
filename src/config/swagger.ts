import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express, Request, Response } from "express";
import path from "path";

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb API",
      version: "1.0.0",
      description: "Full API documentation for Airbnb clone with users, listings, and bookings.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development",
      },
      {
        url: "https://airbnb-api-c4yx.onrender.com",
        description: "Production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/config/swagger.schemas.ts"),
    path.join(process.cwd(), "src/routes/**/*.ts"),
  ],
};

const getSwaggerSpec = () => swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(getSwaggerSpec());
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerUrl: "/api-docs.json",
  }));

  const serverUrl = isProduction 
    ? "https://airbnb-api-c4yx.onrender.com" 
    : `http://localhost:${PORT}`;
  console.log(`Swagger docs available at ${serverUrl}/api-docs`);
}

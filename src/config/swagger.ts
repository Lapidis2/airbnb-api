import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express, Request, Response } from "express";
import path from "path";
const PRODUCTION_URL = process.env["API_URL"] || "https://airbnb-api-c4yx.onrender.com";
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
    url: PRODUCTION_URL,
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
    path.join(process.cwd(), "src/routes/*.ts"),
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

  console.log("Swagger docs available at http://localhost:5000/api-docs");
}

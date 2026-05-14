import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const isDevelopment = process.env.NODE_ENV === "development";
const connectionString = isDevelopment && process.env.localDbUrl
  ? process.env.localDbUrl
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log(`Database connected successfully. (${isDevelopment ? "local" : "production"})`);
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export default prisma;
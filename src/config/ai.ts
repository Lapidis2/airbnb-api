import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

const groqApiKey = process.env["GROQ_API_KEY"];

if (!groqApiKey) {
  console.warn("GROQ_API_KEY is not set in environment variables. AI features will not work.");
}

// Only create models if API key exists
export const model = groqApiKey ? new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  apiKey: groqApiKey,
}) : null;

export const extractionModel = groqApiKey ? new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  apiKey: groqApiKey,
}) : null;

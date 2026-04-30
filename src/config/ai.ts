import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

const groqApiKey = process.env["GROQ_API_KEY"];

if (!groqApiKey) {
  throw new Error("GROQ_API_KEY is required in environment variables");
}


export const model = new ChatGroq({
  model: "llama3-8b-8192",
  temperature: 0.7,
  apiKey: groqApiKey,
});


export const extractionModel = new ChatGroq({
  model: "llama3-8b-8192",
  temperature: 0,
  apiKey: groqApiKey,
});

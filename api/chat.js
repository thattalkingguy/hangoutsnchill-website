import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
  return res.status(405).json({
    error: "Method Not Allowed",
  });
}

try {

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({
      error: "Question is required.",
    });
  }
  const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: question,
});

const answer =
  typeof response.text === "string"
    ? response.text
    : response.text?.() || "No response from Gemini.";

return res.status(200).json({
  success: true,
  answer,
});

catch (error) {

  console.error("Gemini Error:", error);

  return res.status(500).json({
    success: false,
    error: error.message,
    details: error,
  });

}
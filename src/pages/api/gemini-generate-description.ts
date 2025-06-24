import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });
  if (!API_KEY) return res.status(500).json({ message: "Gemini API key missing." });

  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required." });

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Generate a simple, one-sentence task description for a task titled "${title}". Do not use markdown, bullet points, asterisks, or any special formatting. Only return plain text.`;
    const result = await model.generateContent(prompt);
    let description = (await result.response.text()).trim();
    description = description.replace(/[*_`>#-]/g, "").trim();
    res.status(200).json({ description });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate description." });
  }
}
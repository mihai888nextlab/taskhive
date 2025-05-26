import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: Never expose your API key directly in client-side code.
// Use environment variables for sensitive information.
const API_KEY = process.env.GEMINI_API_KEY;

// Check if API key is defined
if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
  // In a production environment, you might want to throw an error or exit.
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY || ''); // Provide a default empty string if API_KEY is undefined

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ message: 'Server configuration error: Gemini API key is missing.' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // You can choose 'gemini-pro' or other available models

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ message: 'Failed to get response from AI.', error: (error as Error).message });
  }
}
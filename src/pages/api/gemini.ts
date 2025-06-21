import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import Task from '@/db/models/taskModel';
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import { addYears } from 'date-fns'; // Ensure this is imported

// IMPORTANT: Never expose your API key directly in client-side code.
// Use environment variables for sensitive information.
const API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || ""; // Ensure JWT_SECRET is defined

// Check if API key is defined
if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
  // In a production environment, you might want to throw an error or exit.
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY || ''); // Provide a default empty string if API_KEY is undefined

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure JSON response header is set
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ message: 'Server configuration error: Gemini API key is missing.' });
  }

  // Verify user authentication
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decodedToken: JWTPayload | null = null;
  try {
    decodedToken = jwt.verify(
      token,
      JWT_SECRET
    ) as JWTPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: -1,
        path: "/",
      })
    );
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!decodedToken || !decodedToken.userId) { // Ensure userId is present in decoded token
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: -1,
        path: "/",
      })
    );
    return res.status(401).json({ message: "Invalid or expired token" });
  }


  const { prompt } = req.body;

  if (typeof prompt !== 'string' || !prompt.trim()) { // Trim to handle empty strings with whitespace
    return res.status(400).json({ message: 'Prompt is required and must be a non-empty string.' });
  }

  // At the top of your handler, after extracting `prompt`:
  const taskCreationRegex = /^(create( a)? task|make( a)? task|add( a)? task)\b/i;

  if (taskCreationRegex.test(prompt.trim())) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Instruct Gemini to extract title and deadline in a structured JSON format
      const today = new Date();
      const todayISO = today.toISOString().split('T')[0];

      const extractionPrompt = `Extract the task title and deadline from the following user request.
If a deadline is not explicitly mentioned or is unclear, set 'deadline' to "none".
If a deadline is relative (e.g., "next Monday", "tomorrow", "in 3 days"), convert it to an ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ) based on today's date (${todayISO}). If the year is not specified, assume the current year. If the parsed date is in the past, adjust it to the next occurrence of that specific date (e.g., 'June 29' requested in July would be next year's June 29). Assume the time for the deadline is end-of-day (23:59:59.999Z).
Return the output as a JSON object with 'title' and 'deadline' keys.
User request: "${prompt}"`;

      const extractionResult = await model.generateContent(extractionPrompt);
      // FIX: Await the .text() Promise!
      const extractionResponseText = await extractionResult.response.text();
      let trimmedExtractionResponseText = extractionResponseText.trim();

      // Remove code block markers and language tags if present
      if (trimmedExtractionResponseText.startsWith('```')) {
        trimmedExtractionResponseText = trimmedExtractionResponseText.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
      }

      let extractedData: { title?: string; deadline?: string } | null = null;
      try {
        extractedData = JSON.parse(trimmedExtractionResponseText);
        if (!extractedData || typeof extractedData.title !== 'string' || !extractedData.deadline) {
          throw new Error('Invalid or incomplete JSON structure from AI. Missing title or deadline.');
        }
      } catch (jsonError) {
        console.error('AI did not return valid JSON for task extraction:', trimmedExtractionResponseText, jsonError);
        return res.status(500).json({
          message: 'AI failed to extract task details correctly. Please try rephrasing or be more explicit. AI response: ' + trimmedExtractionResponseText,
          aiRawResponse: trimmedExtractionResponseText
        });
      }

      // Extract title and deadline
      const title = extractedData.title.trim();
      const deadlineStr = extractedData.deadline.trim();
      let deadline: Date | null = null;

      // Parse the deadline string from AI (ISO format expected)
      if (deadlineStr && deadlineStr.toLowerCase() !== "none") {
        // Only use the date part (YYYY-MM-DD) to avoid timezone issues
        const dateOnly = deadlineStr.split("T")[0];
        deadline = new Date(dateOnly + "T00:00:00");
        if (isNaN(deadline.getTime())) {
          // fallback if AI gave an invalid date
          deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
      } else {
        deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }

      // Create a new task using the Mongoose model
      try {
        const newTask = await Task.create({
          title,
          deadline,
          completed: false,
          userId: decodedToken.userId,
          createdBy: decodedToken.userId,
        });

        // Convert document to plain object for consistent JSON response
        const createdTask = newTask.toObject();
        if (createdTask._id) createdTask._id = createdTask._id.toString();
        if (createdTask.userId) createdTask.userId = createdTask.userId.toString();
        if (createdTask.createdBy) createdTask.createdBy = createdTask.createdBy.toString();

        return res.status(201).json({
          response: `Task created with title "${title}" and deadline "${deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"`,
          createdTask
        });
      } catch (dbError: any) {
        console.error('Database error creating task:', dbError); // <--- This will show the real error!
        return res.status(500).json({
          message: 'Failed to process your request for task creation. Please try again.',
          error: dbError.message
        });
      }
    } catch (error: any) {
      console.error('Error in task creation process (AI extraction/parsing):', error);
      return res.status(500).json({
        message: 'Failed to process your request for task creation. Please try again.',
        error: (error as Error).message
      });
    }
  } else {
    // Fallback: Call the Gemini API if the prompt is not a task creation command.
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Prompt engineering: system message for business/organization assistant
      const systemPrompt = `
You are Hive, an advanced AI assistant specialized in business, organization, and association management. 
Your main goals are to help users:
1. Organize and prioritize tasks, projects, and deadlines efficiently.
2. Suggest best practices for team collaboration and communication.
3. Provide actionable advice for role assignment and responsibility delegation.
4. Offer insights on workflow optimization and productivity improvement.
5. Answer questions about organizational structure, policies, and management strategies.
6. Give clear, concise, and professional responses tailored to business and organizational contexts.
7. When appropriate, provide examples, templates, or step-by-step guides.
8. Always maintain a helpful, supportive, and proactive tone.

User request: ${prompt}
      `.trim();

      const result = await model.generateContent(systemPrompt);
      const responseGen = await result.response;
      const text = await responseGen.text();
      res.status(200).json({ response: text });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ message: 'Failed to get response from AI.', error: (error as Error).message });
    }
  }
}
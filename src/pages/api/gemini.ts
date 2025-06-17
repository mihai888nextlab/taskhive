import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import Task from '@/db/models/taskModel';
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import * as chrono from 'chrono-node';
import { isValid, addYears } from 'date-fns';

const API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || "";

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure JSON response
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  if (!API_KEY) {
    return res.status(500).json({ message: 'Server configuration error: Gemini API key is missing.' });
  }
  
  // Verify user authentication (using cookie token)
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  let decodedToken: { userId: string } | null = null;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  
  const { prompt } = req.body;
  if (typeof prompt !== 'string' || !prompt) {
    return res.status(400).json({ message: 'Prompt is required and must be a string.' });
  }
  
  const lowerPrompt = prompt.trim().toLowerCase();
  // Only trigger task creation if prompt begins with one of these phrases
  const allowedPrefixes = ["make me a task", "make task", "create a task", "create task"];
  const matchingPrefix = allowedPrefixes.find(prefix => lowerPrompt.startsWith(prefix));
  
  if (matchingPrefix) {
    try {
      const remainder = prompt.trim().substring(matchingPrefix.length).trim();
      
      let title = "";
      let deadlineStr = "";
      const lowerRemainder = remainder.toLowerCase();
      
      // Check for "with deadline" first, then fall back to "deadline"
      if (lowerRemainder.includes("with deadline")) {
        title = remainder.substring(0, lowerRemainder.indexOf("with deadline")).trim();
        deadlineStr = remainder.substring(lowerRemainder.indexOf("with deadline") + "with deadline".length).trim();
      } else if (lowerRemainder.includes("deadline")) {
        title = remainder.substring(0, lowerRemainder.indexOf("deadline")).trim();
        deadlineStr = remainder.substring(lowerRemainder.indexOf("deadline") + "deadline".length).trim();
      } else {
        title = remainder; // No deadline part provided.
      }
      
      // Remove trailing "with" if present in title.
      if (title.toLowerCase().endsWith("with")) {
        title = title.substring(0, title.length - 4).trim();
      }
      
      if (!title) {
        return res.status(400).json({ message: 'Could not determine task title. Please provide a clear task title.' });
      }
      
      // Normalize a bit the deadlineStr (optional fixes can be added here)
      if (deadlineStr) {
        deadlineStr = deadlineStr.replace(/tommorow/gi, "tomorrow");
      }
      
      // Use chrono-node to parse natural language deadline
      let deadline: Date | null = null;
      if (deadlineStr) {
        const parsed = chrono.parseDate(deadlineStr, new Date());
        if (parsed && isValid(parsed)) {
          deadline = parsed;
        }
      }
      
      if (!deadline) {
        // Default deadline: 7 days from now if not provided or parsed
        deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else {
        // If the deadline is in the past, assume it's meant for next year.
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        if (deadline < now) {
          deadline = addYears(deadline, 1);
        }
      }
      
      // Create task using authenticated user's ID from token.
      const newTask = await Task.create({
        title,
        deadline,
        completed: false,
        userId: decodedToken.userId,
        createdBy: decodedToken.userId,
      });
      
      // Convert document to plain JSON and force ObjectIDs to strings.
      const createdTask = JSON.parse(JSON.stringify(newTask));
      if (createdTask._id) createdTask._id = createdTask._id.toString();
      if (createdTask.userId) createdTask.userId = createdTask.userId.toString();
      if (createdTask.createdBy) createdTask.createdBy = createdTask.createdBy.toString();
      
      return res.status(201).json({ 
        response: `Task created with title "${title}" and deadline "${deadline.toLocaleDateString()}"`, 
        createdTask 
      });
    } catch (error: any) {
      console.error('Error in task creation process:', error);
      return res.status(500).json({ message: 'Failed to process task creation request. Please try again.' });
    }
  }
  
  // FALLBACK: Call Gemini API if prompt does not start with a task creation command.
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const responseGen = await result.response;
    const text = await responseGen.text();
    return res.status(200).json({ response: text });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ message: 'Failed to get response from AI.', error: error.message });
  }
}
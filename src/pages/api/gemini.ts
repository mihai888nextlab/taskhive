import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import Task from '@/db/models/taskModel';
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import { parse, isValid, addYears } from 'date-fns';

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

  // Verify user authentication
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decodedToken: JWTPayload | null = jwt.verify(
    token,
    process.env.JWT_SECRET || ""
  ) as JWTPayload;

  if (!decodedToken) {
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

  if (typeof prompt !== 'string' || !prompt) {
    return res.status(400).json({ message: 'Prompt is required and must be a string.' });
  }

  // Check if the prompt is asking to create a task.
  if (prompt.toLowerCase().includes("task") || prompt.toLowerCase().includes("create") || prompt.toLowerCase().includes("make")) {
    try {
      const words = prompt.split(/\s+/);
      let titleParts: string[] = [];
      let deadlineStr = "";
      let startIndexForTitle = -1;

      // Define keywords for identifying the start of a task title, in order of priority.
      const titleKeywords = ["title", "task"];
      const deadlineIndicators = ["for", "by", "due", "on", "at", "in", "with", "deadline"];
      const dateWords = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next|today|yesterday)/i;

      // Find the start index for the title based on the prioritized keywords.
      let foundTitleKeyword = false;
      for (const keyword of titleKeywords) {
        const keywordIndex = words.findIndex(word => word.toLowerCase() === keyword);
        if (keywordIndex !== -1) {
          startIndexForTitle = keywordIndex + 1;
          foundTitleKeyword = true;
          break; // Stop after finding the highest priority keyword.
        }
      }

      // If no specific title keyword is found, assume the title starts from the beginning of the prompt.
      if (!foundTitleKeyword) {
          startIndexForTitle = 0;
      }

      // Extract title and deadline by iterating from the determined start index.
      for (let i = startIndexForTitle; i < words.length; i++) {
        const word: string = words[i].toLowerCase();

        // Check if the current word is a deadline indicator.
        if (deadlineIndicators.includes(word)) {
          // Look ahead to confirm if the next word is a date, indicating the start of a deadline.
          const nextWord = words[i + 1]?.toLowerCase();
          if (nextWord && (dateWords.test(nextWord) || (word === "deadline" && nextWord))) {
              deadlineStr = words.slice(i).join(" ");
              break; // Stop collecting title parts and switch to deadline parsing.
          }
        }
        
        titleParts.push(words[i]);
      }

      let title = titleParts.join(" ").trim();

      // Clean up the title (remove any trailing prepositions that were mistakenly included)
      if (title) {
        const lastWord = title.split(/\s+/).pop()?.toLowerCase();
        if (lastWord && deadlineIndicators.includes(lastWord)) {
          title = title.slice(0, title.lastIndexOf(" ")).trim();
        }
      }

      if (!title) {
        return res.status(400).json({ 
          message: 'Could not determine task title. Please provide a clear task title.'
        });
      }

      // Parse the deadline
      let deadline = null;
      if (deadlineStr) {
        console.log('Original deadlineStr after initial cleanup:', deadlineStr);
        
        // Remove prepositions from the start of the deadline string
        deadlineStr = deadlineStr.replace(new RegExp(`^(${deadlineIndicators.join("|")})\\s+`, "i"), "");
        console.log('Cleaned deadlineStr before date-fns parsing:', deadlineStr);
        
        // Try different date formats
        const dateFormats = [
          'MMMM d', // June 29
          'MMMM d yyyy', // June 29 2024
          'd MMMM', // 29 June
          'd MMMM yyyy', // 29 June 2024
          'MMM d', // Jun 29
          'MMM d yyyy', // Jun 29 2024
          'd MMM', // 29 Jun
          'd MMM yyyy', // 29 Jun 2024
          'yyyy-MM-dd', // For explicit year dates
          'yyyy/MM/dd',
          'dd-MM-yyyy',
          'dd/MM/yyyy'
        ];

        let parsedDate = null;
        for (const format of dateFormats) {
          try {
            const date = parse(deadlineStr, format, new Date());
            if (isValid(date)) {
              parsedDate = date;
              break;
            }
          } catch (e) {
            // Continue to next format
          }
        }

        console.log('Parsed date by date-fns (null if failed):', parsedDate);

        if (parsedDate) {
          // If the date is in the past, add a year
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day for comparison
          parsedDate.setHours(0, 0, 0, 0); // Normalize parsedDate to start of day

          if (parsedDate < now) {
            parsedDate = addYears(parsedDate, 1);
            console.log('Date adjusted for next year:', parsedDate);
          }
          deadline = parsedDate;
        } else {
            // Fallback to Gemini for date parsing if date-fns fails
            console.log('date-fns failed, falling back to Gemini for:', deadlineStr);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const datePrompt = `Convert this date to ISO format (YYYY-MM-DDTHH:mm:ss.sssZ). If the year is not specified, assume the current year. If the date is in the past, assume it's for next year. Return ONLY the ISO string, nothing else. Text: "${deadlineStr}"`;
            console.log('Gemini date prompt:', datePrompt);
            const result = await model.generateContent(datePrompt);
            const responseGen = await result.response;
            const isoDate = responseGen.text().trim();
            console.log('Gemini returned ISO date:', isoDate);
            try {
                const geminiParsedDate = new Date(isoDate);
                if (isValid(geminiParsedDate)) {
                    deadline = geminiParsedDate;
                }
            } catch (error) {
                console.error('Error parsing Gemini date response:', error);
            }
        }
      }

      try {
        const newTask = await Task.create({
          title,
          deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now if no deadline
          completed: false,
          userId: decodedToken.userId,
          createdBy: decodedToken.userId,
        });

        return res.status(201).json({ 
          response: `Task created with title "${title}"${deadline ? ` and deadline "${deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"` : ''}`, 
          createdTask: newTask 
        });
      } catch (dbError) {
        console.error('Database error creating task:', dbError);
        return res.status(500).json({ 
          message: 'Failed to save the task to the database. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error in task creation process:', error);
      return res.status(500).json({ 
        message: 'Failed to process your request. Please try again.'
      });
    }
  }

  // Fallback: Call the Gemini API if the prompt is not a task creation command.
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const responseGen = await result.response;
    const text = responseGen.text();
    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ message: 'Failed to get response from AI.', error: (error as Error).message });
  }
}
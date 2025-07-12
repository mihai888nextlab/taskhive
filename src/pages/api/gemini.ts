import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import Task from "@/db/models/taskModel";
import Announcement from "@/db/models/announcementModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel"; // <-- Add this import
import AnnouncementModel from "@/db/models/announcementModel";
import ExpenseModel from "@/db/models/expensesModel";
import dbConnect from "@/db/dbConfig"; // Add this import
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import UserCompany from "@/db/models/userCompanyModel";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const RAG_SOURCES = [
  { model: Task, name: "task", indexName: "tasks_vector_index" }, // Match index names with Atlas config
  {
    model: Announcement,
    name: "announcement",
    indexName: "announcements_vector_index",
  },
  {
    model: UserCompany,
    name: "userCompany",
    indexName: "userCompanies_vector_index",
  },
  // Add other sources/models here
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body;

  // Ensure JSON response header is set
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const JWT_SECRET = process.env.JWT_SECRET || ""; // Ensure JWT_SECRET is defined

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decodedToken: JWTPayload | null = null;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET) as JWTPayload;
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

  if (!decodedToken || !decodedToken.userId || !decodedToken.companyId) {
    // Ensure userId is present in decoded token
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

  // Check if API key is defined
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      message: "Server configuration error: Gemini API key is missing.",
    });
  }

  try {
    await dbConnect();

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: GEMINI_API_KEY,
      model: "text-embedding-004",
    });
    const queryEmbedding = await embeddings.embedQuery(prompt);

    let userCompanyObjectId = new mongoose.Types.ObjectId(
      decodedToken.companyId
    );

    console.log("Comp id:", userCompanyObjectId);

    const searchPromises = RAG_SOURCES.map(
      async ({ model, name, indexName }) => {
        try {
          const results = await model.collection
            .aggregate([
              {
                $vectorSearch: {
                  index: indexName, // Use the specific index name for this collection
                  queryVector: queryEmbedding,
                  path: "embedding", // This field must exist and be indexed in each collection
                  numCandidates: 20, // Consider more candidates for better recall
                  limit: 3, // Get top 3 from each source (adjust as needed)
                  filter: {
                    companyId: userCompanyObjectId, // Ensure we filter by company ID
                  },
                },
              },
              {
                $project: {
                  pageContent: 1, // The RAG-specific content field
                  score: { $meta: "vectorSearchScore" }, // Similarity score
                  metadata: 1, // Include the metadata to know the source and original ID
                },
              },
            ])
            .toArray();
          // Add source information to each result for better context in LLM prompt
          return results.map((r) => ({ ...r, source: name }));
        } catch (err) {
          console.error(
            `Error searching in ${name} collection with index ${indexName}:`,
            err
          );
          return []; // Return empty array if search fails for a specific collection
        }
      }
    );

    const allResults = (await Promise.all(searchPromises)).flat(); // Flatten the array of arrays of results

    // Sort all results by score (highest score = most relevant) and take the top N overall
    allResults.sort((a: any, b: any) => b.score - a.score);
    const topNResults = allResults.slice(0, 5); // Get top 5 overall most relevant results

    // Format the retrieved context for the LLM prompt
    const retrievedContext = topNResults
      .map((r: any) => {
        const sourceName =
          r.metadata?.source || r.source || "unknown application data";
        const originalTitle =
          r.metadata?.title ||
          r.metadata?.taskTitle ||
          r.metadata?.announcementTitle ||
          r.metadata?.userName ||
          "N/A";
        const originalId = r.metadata?.originalId || "N/A";

        // Provide clear structure and source attribution in the context
        return `--- Source: ${sourceName} (ID: ${originalId}, Title: ${originalTitle}) ---\n${r.pageContent}`;
      })
      .join("\n\n");

    console.log("Retrieved Context (combined):", retrievedContext);

    const chatModel = new ChatGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      maxOutputTokens: 500, // Adjust as needed
      temperature: 0.7, // Adjust for creativity vs. accuracy
    });

    const promptTemplate = PromptTemplate.fromTemplate(`
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

      IMPORTANT: Keep responses concise and focused. Aim for 3-6 sentences maximum unless the user specifically requests detailed explanations. Use bullet points for lists and be direct and actionable.

      You are a helpful AI assistant that answers questions based on provided context.
      The context comes from various parts of an application like tasks, announcements, or user profiles.
      Always try to identify the source of the information you use in your answer (e.g., "According to the task titled '...", "From an announcement about...", "Based on a user's profile...").
      If you cannot find the answer in the provided context, clearly state that you don't know. Do not invent information.

      Context:
      ${retrievedContext}

      Question:
      ${prompt}

      Answer:
    `);

    const chain = RunnableSequence.from([
      {
        context: (input: { question: string; context: string }) =>
          input.context,
        question: (input: { question: string; context: string }) =>
          input.question,
      },
      promptTemplate,
      chatModel,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({
      question: prompt,
      context: retrievedContext,
    });

    res.status(200).json({ response });
  } catch (error) {}

  // Verify user authentication
  // const cookies = cookie.parse(req.headers.cookie || "");
  // const token = cookies.auth_token;

  // if (!token) {
  //   return res.status(401).json({ message: "No token provided" });
  // }

  // let decodedToken: JWTPayload | null = null;
  // try {
  //   decodedToken = jwt.verify(
  //     token,
  //     JWT_SECRET
  //   ) as JWTPayload;
  // } catch (error) {
  //   console.error("JWT verification error:", error);
  //   res.setHeader(
  //     "Set-Cookie",
  //     cookie.serialize("auth_token", "", {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "lax",
  //       maxAge: -1,
  //       path: "/",
  //     })
  //   );
  //   return res.status(401).json({ message: "Invalid or expired token" });
  // }

  // if (!decodedToken || !decodedToken.userId) { // Ensure userId is present in decoded token
  //   res.setHeader(
  //     "Set-Cookie",
  //     cookie.serialize("auth_token", "", {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "lax",
  //       maxAge: -1,
  //       path: "/",
  //     })
  //   );
  //   return res.status(401).json({ message: "Invalid or expired token" });
  // }

  // if (typeof prompt !== 'string' || !prompt.trim()) {
  //   return res.status(400).json({ message: 'Prompt is required and must be a non-empty string.' });
  // }

  /*
  // --- ANNOUNCEMENT CREATION FIRST ---
  const announcementCreationRegex =
    /^(create|add|make)( an)? (announcement|anunț|anunt|anunț|anunțare|anuntare)\b/i;

  if (announcementCreationRegex.test(prompt.trim())) {
    // --- ADMIN CHECK ---
    if (
      !decodedToken.role ||
      decodedToken.role.trim().toLowerCase() !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Only admins can create announcements." });
    }
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const todayISO = new Date().toISOString();

      // Extraction prompt for announcements
      const extractionPrompt = `Extract the announcement title, content, category, pinned status, and expiration date from the following user request.
If a category is not mentioned, set 'category' to "Update".
If 'pinned' is not mentioned, set it to false.
If an expiration date is not mentioned, set 'expiresAt' to null.
If a date is relative (e.g., "next Monday", "in 3 days"), convert it to ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) based on today's date (${todayISO}). If the year is not specified, assume the current year. If the parsed date is in the past, adjust it to the next occurrence of that date. Assume the time is end-of-day (23:59:59.999Z).
Return ONLY a valid JSON object with keys: 'title', 'content', 'category', 'pinned', 'expiresAt'. Do not include any explanation, markdown, commentary, or text before or after the JSON. Only output the JSON object, nothing else.
User request: "${prompt}"`;

      const extractionResult = await model.generateContent(extractionPrompt);
      let extractionResponseText = (
        await extractionResult.response.text()
      ).trim();

      // Remove code block markers if present
      if (extractionResponseText.startsWith("```")) {
        extractionResponseText = extractionResponseText
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/```$/, "")
          .trim();
      }

      let extractedData: {
        title?: string;
        content?: string;
        category?: string;
        pinned?: boolean;
        expiresAt?: string | null;
      } | null = null;
      try {
        extractedData = JSON.parse(extractionResponseText);
        if (
          !extractedData ||
          typeof extractedData.title !== "string" ||
          typeof extractedData.content !== "string"
        ) {
          throw new Error(
            "Invalid or incomplete JSON structure from AI. Missing title or content."
          );
        }
      } catch (jsonError) {
        console.error(
          "AI did not return valid JSON for announcement extraction:",
          extractionResponseText,
          jsonError
        );
        return res.status(500).json({
          message:
            "AI failed to extract announcement details correctly. Please try rephrasing or be more explicit. AI response: " +
            extractionResponseText,
          aiRawResponse: extractionResponseText,
        });
      }

      // Prepare fields
      const title = extractedData.title.trim();
      const content = extractedData.content.trim();
      const category = (extractedData.category || "Update").trim();
      const pinned =
        typeof extractedData.pinned === "boolean"
          ? extractedData.pinned
          : false;
      let expiresAt: Date | undefined = undefined;
      if (extractedData.expiresAt && extractedData.expiresAt !== "null") {
        const dateOnly = extractedData.expiresAt.split("T")[0];
        const parsed = new Date(dateOnly + "T23:59:59.999Z");
        if (!isNaN(parsed.getTime())) expiresAt = parsed;
      }

      // --- NEW: Adjust expiresAt if it's tomorrow but not end of day ---
      const promptLower = prompt.toLowerCase();
      if (
        expiresAt &&
        promptLower.includes("tomorrow") &&
        Math.abs(
          expiresAt.getTime() -
            (new Date().setHours(23, 59, 59, 999) + 24 * 60 * 60 * 1000)
        ) >
          12 * 60 * 60 * 1000 // more than 12h off
      ) {
        // Force expiresAt to tomorrow at end of day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        expiresAt = tomorrow;
      }

      // Create the announcement
      try {
        const newAnnouncement = await AnnouncementModel.create({
          title,
          content,
          category,
          pinned,
          expiresAt,
          createdBy: decodedToken.userId,
        });

        const createdAnnouncement = newAnnouncement.toObject();
        if (createdAnnouncement._id)
          createdAnnouncement._id = createdAnnouncement._id.toString();
        if (createdAnnouncement.createdBy)
          createdAnnouncement.createdBy =
            createdAnnouncement.createdBy.toString();

        return res.status(201).json({
          response: `Announcement created with title "${title}" in category "${category}".`,
          createdAnnouncement,
        });
      } catch (dbError: any) {
        console.error("Database error creating announcement:", dbError);
        return res.status(500).json({
          message: "Failed to create announcement. Please try again.",
          error: dbError.message,
        });
      }
    } catch (error: any) {
      console.error(
        "Error in announcement creation process (AI extraction/parsing):",
        error
      );
      return res.status(500).json({
        message:
          "Failed to process your request for announcement creation. Please try again.",
        error: (error as Error).message,
      });
    }
    return; // Prevent further processing
  }

  // --- ENHANCED TASK CREATION LOGIC WITH SUBTASKS ---
  const taskCreationRegex =
    /^(create( a)? task|make( a)? task|add( a)? task)\b/i;

  if (taskCreationRegex.test(prompt.trim())) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Define today's date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
      const todayISO = new Date().toISOString();

      // Enhanced extraction prompt that also handles subtasks
      const extractionPrompt = `Extract the task details from the following user request.
If a deadline is not explicitly mentioned or is unclear, set 'deadline' to "none".
If a deadline is relative (e.g., "next Monday", "tomorrow", "in 3 days"), convert it to an ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ) based on today's date (${todayISO}). If the year is not specified, assume the current year. If the parsed date is in the past, adjust it to the next occurrence of that specific date. Assume the time for the deadline is end-of-day (23:59:59.999Z).
If the assignee is not specified or is "me", "myself", or similar, set 'assignee' to "self".
If a description is not mentioned, set 'description' to an empty string.

SUBTASK DETECTION: Set 'generateSubtasks' to true if ANY of these conditions are met:
- Keywords: "subtasks", "sub-tasks", "steps", "breakdown", "break down", "break it down", "phases", "stages", "tasks", "components", "parts", "divide", "split", "organize", "structure", "plan out", "outline", "step by step", "detailed", "comprehensive", "thorough"
- Complex tasks that naturally need multiple steps (project planning, presentations, events, launches, implementations, research, training, etc.)
- Tasks mentioning "prepare", "organize", "develop", "create", "build", "design", "implement", "launch", "setup", "establish"
- Multi-part activities or anything that seems like it would benefit from being broken down
- If the task title is longer than 6 words or seems complex in nature

Otherwise, set 'generateSubtasks' to false for simple, single-action tasks.

Return the output as a JSON object with 'title', 'deadline', 'assignee', 'description', and 'generateSubtasks' keys.
User request: "${prompt}"`;

      const extractionResult = await model.generateContent(extractionPrompt);
      const extractionResponseText = await extractionResult.response.text();
      let trimmedExtractionResponseText = extractionResponseText.trim();

      // Remove code block markers and language tags if present
      if (trimmedExtractionResponseText.startsWith("```")) {
        trimmedExtractionResponseText = trimmedExtractionResponseText
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/```$/, "")
          .trim();
      }

      let extractedData: {
        title?: string;
        deadline?: string;
        assignee?: string;
        description?: string;
        generateSubtasks?: boolean;
      } | null = null;

      try {
        extractedData = JSON.parse(trimmedExtractionResponseText);
        if (
          !extractedData ||
          typeof extractedData.title !== "string" ||
          !extractedData.deadline
        ) {
          throw new Error(
            "Invalid or incomplete JSON structure from AI. Missing title or deadline."
          );
        }
      } catch (jsonError) {
        console.error(
          "AI did not return valid JSON for task extraction:",
          trimmedExtractionResponseText,
          jsonError
        );
        return res.status(500).json({
          message:
            "AI failed to extract task details correctly. Please try rephrasing or be more explicit. AI response: " +
            trimmedExtractionResponseText,
          aiRawResponse: trimmedExtractionResponseText,
        });
      }

      // Extract title, deadline, and description
      const title = extractedData.title.trim();
      let description = (extractedData.description || "").trim();
      const deadlineStr = extractedData.deadline.trim();
      const shouldGenerateSubtasks = extractedData.generateSubtasks || false;
      let deadline: Date | null = null;

      // If description is missing or empty, generate one using Gemini
      if (!description) {
        const descPrompt = `Generate a simple, one-sentence task description for a task titled "${title}". Do not use markdown, bullet points, asterisks, or any special formatting. Only return plain text.`;
        const descResult = await model.generateContent(descPrompt);
        description = (await descResult.response.text()).trim();
      }

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

      // --- Determine assignee ---
      let assigneeUserId = decodedToken.userId; // default to self
      let assigneeName = extractedData.assignee?.trim().toLowerCase() || "self";

      if (
        assigneeName !== "self" &&
        assigneeName !== "me" &&
        assigneeName !== "myself"
      ) {
        // Try to split the assigneeName for first/last name matching
        const nameParts = assigneeName.split(" ").filter(Boolean);
        let userDoc = null;

        if (nameParts.length >= 2) {
          // Try to match both first and last name
          userDoc = await userModel
            .findOne({
              firstName: new RegExp(nameParts[0], "i"),
              lastName: new RegExp(nameParts.slice(1).join(" "), "i"),
            })
            .lean();
        }

        // If not found, try matching firstName or lastName or email
        if (!userDoc) {
          userDoc = await userModel
            .findOne({
              $or: [
                { firstName: new RegExp(assigneeName, "i") },
                { lastName: new RegExp(assigneeName, "i") },
                { email: new RegExp(assigneeName, "i") },
              ],
            })
            .lean();
        }

        if (!userDoc) {
          return res.status(400).json({
            message: `Assignee "${extractedData.assignee}" does not exist in the system.`,
          });
        }

        // 2. Fetch users-below-me (by id)
        const rolesBelowRes = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/roles-below-me`,
          {
            headers: {
              cookie: req.headers.cookie || "",
            },
          }
        );
        const rolesBelowData = await rolesBelowRes.json();
        const usersBelow = rolesBelowData.usersBelow || [];

        // 3. Check if userDoc._id is in usersBelow
        const assigneeId = (userDoc as any)._id?.toString?.() || "";
        const isBelow = usersBelow.some(
          (u: any) => u.userId?.toString() === assigneeId
        );

        if (!isBelow) {
          return res.status(400).json({
            message: `Assignee "${extractedData.assignee}" is not in your roles-below-me.`,
          });
        }

        assigneeUserId = Array.isArray(userDoc)
          ? userDoc[0]?._id?.toString?.() || ""
          : userDoc._id?.toString?.() || "";
      }

      // --- Generate subtasks if requested ---
      let subtasks: Array<{ title: string; description: string }> = [];

      if (shouldGenerateSubtasks) {
        try {
          const subtaskPrompt = `Analyze this task and break it down into 3-5 logical, actionable subtasks:

**Main Task:** ${title}
**Description:** ${description}
**Context:** This is a ${title.split(" ").length > 4 ? "complex" : "standard"} task that needs to be broken into manageable steps.

Create subtasks that:
- Follow a logical sequence (planning → execution → completion)
- Are specific and actionable (avoid vague terms)
- Can be completed independently
- Make sense for the task type and complexity
- Are appropriately sized (not too granular, not too broad)

Return ONLY a valid JSON array of objects with "title" and "description" fields.
- Title: 3-6 words, action-oriented (Start with verbs like "Research", "Create", "Review", "Finalize")
- Description: 1-2 sentences explaining the specific actions needed

Example format:
[
  {"title": "Research requirements", "description": "Gather all necessary information, requirements, and resources needed for the task."},
  {"title": "Create initial draft", "description": "Develop the first version or prototype of the deliverable."},
  {"title": "Review and refine", "description": "Test, review, and make necessary improvements to ensure quality."},
  {"title": "Finalize and deliver", "description": "Complete final checks and deliver the finished work."}
]

Return ONLY the JSON array, no explanations.`;

          const subtaskResult = await model.generateContent(subtaskPrompt);
          let subtaskResponseText = (
            await subtaskResult.response.text()
          ).trim();

          // Clean the response
          if (subtaskResponseText.startsWith("```")) {
            subtaskResponseText = subtaskResponseText
              .replace(/^```[a-zA-Z]*\n?/, "")
              .replace(/```$/, "")
              .trim();
          }

          // Try to extract JSON array from the response
          const jsonMatch = subtaskResponseText.match(/\[[\s\S]*\]/);
          const jsonString = jsonMatch ? jsonMatch[0] : subtaskResponseText;

          try {
            const parsedSubtasks = JSON.parse(jsonString);
            if (Array.isArray(parsedSubtasks) && parsedSubtasks.length > 0) {
              subtasks = parsedSubtasks.filter(
                (st) => st.title && st.description
              );
            }
          } catch (parseError) {
            console.error("Failed to parse generated subtasks:", parseError);
            // Continue without subtasks if parsing fails
          }
        } catch (subtaskError) {
          console.error("Error generating subtasks:", subtaskError);
          // Continue without subtasks if generation fails
        }
      }

      // --- Create the main task ---
      try {
        const newTask = await Task.create({
          title,
          description,
          deadline,
          completed: false,
          userId: assigneeUserId,
          createdBy: decodedToken.userId,
        });

        const mainTaskId = newTask._id.toString();
        let createdSubtasks: any[] = [];

        // Prepare response message before any usage
        let responseMessage = `Task created with title "${title}" and deadline "${deadline.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}" for ${assigneeName === "self" ? "yourself" : extractedData.assignee}`;

        // --- Create subtasks if any were generated ---
        if (subtasks.length > 0) {
          try {
            const createdSubtasks = [];

            for (const subtask of subtasks) {
              const newSubtask = await Task.create({
                title: subtask.title,
                description: subtask.description,
                deadline,
                completed: false,
                userId: assigneeUserId,
                createdBy: decodedToken.userId,
                parentTask: mainTaskId,
                isSubtask: true, // Explicitly set this
              });
              createdSubtasks.push(newSubtask);
            }

            // Update parent task with subtask IDs for bidirectional reference
            await Task.findByIdAndUpdate(mainTaskId, {
              subtasks: createdSubtasks.map((st) => st._id),
            });

            // Convert to plain objects for response
            const subtaskObjects = createdSubtasks.map((st) => {
              const obj = st.toObject();
              if (obj._id) obj._id = obj._id.toString();
              if (obj.userId) obj.userId = obj.userId.toString();
              if (obj.createdBy) obj.createdBy = obj.createdBy.toString();
              if (obj.parentTask) obj.parentTask = obj.parentTask.toString();
              return obj;
            });

            // Declare and assign createdTask before using it
            const createdTask = newTask.toObject();
            if (createdTask._id) createdTask._id = createdTask._id.toString();
            if (createdTask.userId)
              createdTask.userId = createdTask.userId.toString();
            if (createdTask.createdBy)
              createdTask.createdBy = createdTask.createdBy.toString();

            return res.status(201).json({
              response: `${responseMessage} with ${createdSubtasks.length} subtasks`,
              createdTask: createdTask,
              createdSubtasks: subtaskObjects,
            });
          } catch (subtaskError) {
            console.error("Error creating subtasks:", subtaskError);
            // Declare and assign createdTask before using it in the error response
            const createdTask = newTask.toObject();
            if (createdTask._id) createdTask._id = createdTask._id.toString();
            if (createdTask.userId)
              createdTask.userId = createdTask.userId.toString();
            if (createdTask.createdBy)
              createdTask.createdBy = createdTask.createdBy.toString();
            // Return the main task even if subtasks fail
            return res.status(201).json({
              response: responseMessage + " (subtasks failed to create)",
              createdTask,
            });
          }
        }

        const createdTask = newTask.toObject();
        if (createdTask._id) createdTask._id = createdTask._id.toString();
        if (createdTask.userId)
          createdTask.userId = createdTask.userId.toString();
        if (createdTask.createdBy)
          createdTask.createdBy = createdTask.createdBy.toString();

        if (createdSubtasks.length > 0) {
          responseMessage += ` with ${createdSubtasks.length} subtasks`;
        }

        return res.status(201).json({
          response: responseMessage,
          createdTask,
          createdSubtasks:
            createdSubtasks.length > 0 ? createdSubtasks : undefined,
        });
      } catch (dbError: any) {
        console.error("Database error creating task:", dbError);
        return res.status(500).json({
          message:
            "Failed to process your request for task creation. Please try again.",
          error: dbError.message,
        });
      }
    } catch (error: any) {
      console.error(
        "Error in task creation process (AI extraction/parsing):",
        error
      );
      return res.status(500).json({
        message:
          "Failed to process your request for task creation. Please try again.",
        error: (error as Error).message,
      });
    }
  }

  // --- EXPENSE/INCOME CREATION LOGIC ---
  const expenseCreationRegex =
    /^(add|create|record|log|register)\s+(an?\s+)?(expense|income)\b/i;

  if (expenseCreationRegex.test(prompt.trim())) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const todayISO = new Date().toISOString();

      // Extraction prompt for expenses/incomes
      const extractionPrompt = `Extract the following fields from the user request about an expense or income:
- title: short title of the expense/income
- amount: the numeric value (as a number)
- description: details or reason
- type: "expense" or "income"
- category: if not mentioned, set to "General"
- date: if not mentioned, set to today's date (${todayISO}), otherwise convert to ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
Return ONLY a valid JSON object with keys: 'title', 'amount', 'description', 'type', 'category', 'date'. Do not include any explanation, markdown, commentary, or text before or after the JSON. Only output the JSON object, nothing else.
User request: "${prompt}"`;

      const extractionResult = await model.generateContent(extractionPrompt);
      let extractionResponseText = (
        await extractionResult.response.text()
      ).trim();

      // Remove code block markers if present
      if (extractionResponseText.startsWith("```")) {
        extractionResponseText = extractionResponseText
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/```$/, "")
          .trim();
      }

      let extractedData: {
        title?: string;
        amount?: number;
        description?: string;
        type?: string;
        category?: string;
        date?: string;
      } | null = null;
      try {
        extractedData = JSON.parse(extractionResponseText);
        if (
          !extractedData ||
          typeof extractedData.title !== "string" ||
          typeof extractedData.amount !== "number" ||
          typeof extractedData.type !== "string"
        ) {
          throw new Error(
            "Invalid or incomplete JSON structure from AI. Missing title, amount, or type."
          );
        }
      } catch (jsonError) {
        console.error(
          "AI did not return valid JSON for expense/income extraction:",
          extractionResponseText,
          jsonError
        );
        return res.status(500).json({
          message:
            "AI failed to extract expense/income details correctly. Please try rephrasing or be more explicit. AI response: " +
            extractionResponseText,
          aiRawResponse: extractionResponseText,
        });
      }

      // Prepare fields
      const title = extractedData.title.trim();
      const amount = extractedData.amount;
      const description = (extractedData.description || "").trim();
      const type =
        extractedData.type.trim().toLowerCase() === "income"
          ? "income"
          : "expense";
      const category = (extractedData.category || "General").trim();
      let date = new Date();
      if (extractedData.date) {
        const parsed = new Date(extractedData.date);
        if (!isNaN(parsed.getTime())) date = parsed;
      }

      // Save to database
      try {
        const newItem = await ExpenseModel.create({
          userId: decodedToken.userId,
          companyId: decodedToken.companyId,
          title,
          amount,
          description,
          type,
          category,
          date,
        });

        const createdItem = newItem.toObject();
        if (createdItem._id) createdItem._id = createdItem._id.toString();
        if (createdItem.userId)
          createdItem.userId = createdItem.userId.toString();
        if (createdItem.companyId)
          createdItem.companyId = createdItem.companyId.toString();

        return res.status(201).json({
          response: `${type === "income" ? "Income" : "Expense"} recorded: "${title}" for amount ${amount}.`,
          createdItem,
        });
      } catch (dbError: any) {
        console.error("Database error creating expense/income:", dbError);
        return res.status(500).json({
          message: "Failed to save expense/income. Please try again.",
          error: dbError.message,
        });
      }
    } catch (error: any) {
      console.error(
        "Error in expense/income creation process (AI extraction/parsing):",
        error
      );
      return res.status(500).json({
        message:
          "Failed to process your request for expense/income creation. Please try again.",
        error: (error as Error).message,
      });
    }
    return; // Prevent further processing
  }

  // --- SUBTASK GENERATION LOGIC ---
  // Check if this is a subtask generation request
  const isSubtaskGeneration =
    prompt.includes("break it down into") ||
    prompt.includes("Generate subtasks") ||
    prompt.includes("actionable subtasks") ||
    prompt.includes("logical steps");

  if (isSubtaskGeneration) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const subtaskPrompt = `${prompt}

Please return ONLY a valid JSON array of objects with "title" and "description" fields for each subtask.
Each subtask title should be 3-8 words maximum.
Generate 3-5 subtasks that are specific, actionable, and follow a logical sequence.

Example format:
[
  {"title": "Research requirements", "description": "Gather all necessary information and requirements"},
  {"title": "Create initial draft", "description": "Develop the first version of the deliverable"}
]

Return ONLY the JSON array, no explanations or additional text.`;

      const result = await model.generateContent(subtaskPrompt);
      const responseText = await result.response.text();

      // Clean the response
      let cleanResponse = responseText.trim();

      // Remove code block markers if present
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/```$/, "")
          .trim();
      }

      // Try to extract JSON array from the response
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanResponse;

      try {
        const subtasks = JSON.parse(jsonString);
        if (Array.isArray(subtasks)) {
          // Return the response in the format expected by generate-subtasks.ts
          return res.status(200).json({ response: JSON.stringify(subtasks) });
        } else {
          throw new Error("Response is not an array");
        }
      } catch (parseError) {
        console.error("Failed to parse subtasks JSON:", parseError);
        // Return fallback subtasks
        const fallbackSubtasks = [
          {
            title: "Plan and research",
            description: "Define requirements and gather necessary resources",
          },
          {
            title: "Design approach",
            description: "Create a detailed plan and strategy",
          },
          {
            title: "Execute main work",
            description: "Perform the core activities and implementation",
          },
          {
            title: "Review and finalize",
            description: "Check quality and complete final steps",
          },
        ];
        return res
          .status(200)
          .json({ response: JSON.stringify(fallbackSubtasks) });
      }
    } catch (error) {
      console.error("Error generating subtasks:", error);
      // Return fallback subtasks on error
      const fallbackSubtasks = [
        {
          title: "Plan approach",
          description: "Define the strategy and approach for the task",
        },
        {
          title: "Gather resources",
          description: "Collect all necessary materials and information",
        },
        {
          title: "Execute work",
          description: "Perform the core activities of the task",
        },
        {
          title: "Review and finalize",
          description: "Check quality and complete final steps",
        },
      ];
      return res
        .status(200)
        .json({ response: JSON.stringify(fallbackSubtasks) });
    }
  }

  // --- FALLBACK: GENERAL GEMINI CHAT ---
  else {
    try {
      const result = await model.generateContent(systemPrompt);
      const responseGen = await result.response;
      const text = await responseGen.text();
      res.status(200).json({ response: text });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res
        .status(500)
        .json({
          message: "Failed to get response from AI.",
          error: (error as Error).message,
        });
    }
  }

  */
}

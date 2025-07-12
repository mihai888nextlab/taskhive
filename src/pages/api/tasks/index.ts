// src/pages/api/tasks/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import Task from "@/db/models/taskModel";
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { Types } from "mongoose";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "text-embedding-004",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // Authentication
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication required: No token provided" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authentication required: Invalid token" });
  }

  const userId = new Types.ObjectId(decodedToken.userId);

  if (req.method === "GET") {
    try {
      // Return all main tasks assigned to the user AND all subtasks assigned to the user
      const mainTasks = await Task.find({
        userId: userId,
        companyId: decodedToken.companyId,
        $or: [{ isSubtask: { $exists: false } }, { isSubtask: false }],
      })
        .sort({ createdAt: -1 })
        .populate("createdBy", "firstName lastName email")
        .populate("userId", "firstName lastName email")
        .populate({
          path: "subtasks",
          populate: [
            { path: "createdBy", select: "firstName lastName email" },
            { path: "userId", select: "firstName lastName email" },
          ],
        })
        .populate("parentTask", "title createdBy");

      // Find all subtasks assigned to the user (even if parent task is not assigned to them)
      const subtasks = await Task.find({
        userId: userId,
        companyId: decodedToken.companyId,
        isSubtask: true,
      })
        .sort({ createdAt: -1 })
        .populate("createdBy", "firstName lastName email")
        .populate("userId", "firstName lastName email")
        .populate("parentTask", "title createdBy");

      // Merge main tasks and subtasks, but avoid duplicates
      // If a subtask is already included in mainTasks.subtasks, skip it
      const mainTaskSubtaskIds = new Set(
        mainTasks.flatMap(t => t.subtasks?.map((st: any) => String(st._id)) || [])
      );
      const filteredSubtasks = subtasks.filter(st => !mainTaskSubtaskIds.has(String(st._id)));

      // Return both main tasks and subtasks as a flat array
      res.status(200).json([...mainTasks, ...filteredSubtasks]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({
        message: "Failed to fetch tasks.",
        error: (error as Error).message,
      });
    }
  } else if (req.method === "POST") {
    const { title, description, deadline, assignedTo, priority, subtasks, tags } =
      req.body;

    if (!title || !deadline) {
      return res
        .status(400)
        .json({ message: "Title and deadline are required." });
    }

    try {
      const assignedUserId =
        assignedTo && assignedTo.trim()
          ? Types.ObjectId.createFromHexString(assignedTo)
          : userId;

      // Create the main task first
      const newTask = await Task.create({
        title: title.trim(),
        description: description?.trim() || "",
        deadline: new Date(deadline),
        userId: assignedUserId,
        createdBy: userId,
        companyId: decodedToken.companyId,
        priority: priority || "medium",
        isSubtask: false,
        subtasks: [],
        tags: tags || [], // <-- Add this line
      });

      // RAG (Retrieval-Augmented Generation) Fields
      const rawPageContent = `Task Title: ${newTask.title}. Description: ${newTask.description}. Priority: ${newTask.priority}. Completed: ${newTask.completed}. Due Date: ${newTask.deadline?.toLocaleDateString() || "N/A"}.`;
      const chunks = await splitter.createDocuments([rawPageContent]);
      const contentToEmbed = chunks[0].pageContent; // Take the first chunk
      const newEmbedding = await embeddings.embedQuery(contentToEmbed);
      const newMetadata = {
        source: "task",
        originalId: newTask._id,
        title: newTask.title,
        completed: newTask.completed,
        // Add any other relevant fields for the AI or linking
      };

      newTask.pageContent = contentToEmbed;
      newTask.embedding = newEmbedding;
      newTask.metadata = newMetadata;

      await newTask.save(); // Save the updated task with RAG fields

      // Create subtasks if provided
      if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
        const subtaskIds = [];

        for (const subtask of subtasks) {
          if (subtask.title && subtask.title.trim()) {
            const subtaskAssignedUserId =
              subtask.assignedTo && subtask.assignedTo.trim()
                ? Types.ObjectId.createFromHexString(subtask.assignedTo)
                : userId;
            const createdSubtask = await Task.create({
              title: subtask.title.trim(),
              description: subtask.description || "",
              deadline: new Date(deadline),
              userId: subtaskAssignedUserId,
              assignedTo: subtaskAssignedUserId, // Explicit assignee
              assignedBy: userId, // Explicit assigner
              createdBy: userId,
              companyId: decodedToken.companyId,
              priority: priority || "medium",
              isSubtask: true,
              parentTask: newTask._id,
              tags: subtask.tags || [],
            });

            // RAG Fields for subtask
            const subtaskRawPageContent = `Subtask Title: ${createdSubtask.title}. Description: ${createdSubtask.description}. Priority: ${createdSubtask.priority}. Completed: ${createdSubtask.completed}. Due Date: ${createdSubtask.deadline?.toLocaleDateString() || "N/A"}.`;
            const subtaskChunks = await splitter.createDocuments([subtaskRawPageContent]);
            const subtaskContentToEmbed = subtaskChunks[0].pageContent;
            const subtaskEmbedding = await embeddings.embedQuery(subtaskContentToEmbed);
            const subtaskMetadata = {
              source: "subtask",
              originalId: createdSubtask._id,
              title: createdSubtask.title,
              completed: createdSubtask.completed,
              // Add any other relevant fields for the AI or linking
            };

            createdSubtask.pageContent = subtaskContentToEmbed;
            createdSubtask.embedding = subtaskEmbedding;
            createdSubtask.metadata = subtaskMetadata;
            await createdSubtask.save(); // Save the subtask with RAG fields
            subtaskIds.push(createdSubtask._id);
          }
        }

        // Update the main task with subtask references
        if (subtaskIds.length > 0) {
          await Task.findByIdAndUpdate(newTask._id, {
            subtasks: subtaskIds,
          });
        }
      }

      // Return the created task with populated subtasks
      const populatedTask = await Task.findById(newTask._id)
        .populate({
          path: "subtasks",
          populate: [
            { path: "createdBy", select: "firstName lastName email" },
            { path: "userId", select: "firstName lastName email" },
          ],
        })
        .populate("createdBy", "firstName lastName email")
        .populate("userId", "firstName lastName email")
        .populate("parentTask", "title createdBy"); // <-- Add this line

      res.status(201).json(populatedTask);
    } catch (error) {
      console.error("Error creating task:", error);

      if (error instanceof Error && error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      if (error instanceof Error && error.name === "CastError") {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      res.status(500).json({
        message: "Failed to create task.",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// No changes needed. API logic is correct and robust.

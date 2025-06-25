// src/pages/api/tasks/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import Task from "@/db/models/taskModel"; // Import your Task model
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { Types } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query; // Get task ID from URL (e.g., /api/tasks/654321...)

  // --- Authentication Middleware ---
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required: No token provided" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch (error) {
    return res.status(401).json({ message: "Authentication required: Invalid token" });
  }

  const userId = new Types.ObjectId(decodedToken.userId); // Get the userId from the decoded token
  // --- End Authentication Middleware ---

  // Validate if 'id' is a valid MongoDB ObjectId format
  if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID format." });
  }

  const taskId = new Types.ObjectId(id); // Convert string ID to Mongoose ObjectId

  if (req.method === "PUT") {
    const { title, description, deadline, completed, important } = req.body;

    try {
      // Find the task by ID and userId to ensure ownership
      const updatedTask = await Task.findOneAndUpdate(
        { 
          _id: taskId, 
          $or: [
            { userId: userId }, 
            { createdBy: userId }
          ]
        },
        { 
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : undefined }),
          ...(completed !== undefined && { completed }),
          ...(important !== undefined && { important }),
        },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found or you don't have permission to update it." });
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update task.", error: (error as Error).message });
    }
  } else if (req.method === "DELETE") {
    // Only allow if userId matches
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssignee = String(task.userId) === String(decodedToken.userId);
    const isAssigner = String(task.createdBy) === String(decodedToken.userId);

    if (!isAssignee && !isAssigner) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Task.deleteOne({ _id: id });
    return res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
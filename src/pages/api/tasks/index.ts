// src/pages/api/tasks/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import Task from "@/db/models/taskModel";
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { Types } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Authentication
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required: No token provided" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
  } catch (error) {
    return res.status(401).json({ message: "Authentication required: Invalid token" });
  }

  const userId = new Types.ObjectId(decodedToken.userId);

  if (req.method === "GET") {
    try {
      // Only return main tasks (not subtasks) assigned to the authenticated user
      const tasks = await Task.find({
        userId: userId,
        $or: [
          { isSubtask: { $exists: false } },
          { isSubtask: false }
        ]
      })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'firstName lastName email')
        .populate('userId', 'firstName lastName email')
        .populate({
          path: 'subtasks',
          populate: [
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'userId', select: 'firstName lastName email' }
          ]
        });
      
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks.", error: (error as Error).message });
    }
  } else if (req.method === "POST") {
    const { title, description, deadline, assignedTo, priority, subtasks } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ message: "Title and deadline are required." });
    }

    try {
      const assignedUserId = assignedTo && assignedTo.trim() 
        ? Types.ObjectId.createFromHexString(assignedTo) 
        : userId;
      
      // Create the main task first
      const newTask = await Task.create({
        title: title.trim(),
        description: description?.trim() || '',
        deadline: new Date(deadline),
        userId: assignedUserId,
        createdBy: userId,
        priority: priority || 'medium',
        isSubtask: false,
        subtasks: [],
      });

      // Create subtasks if provided
      if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
        const subtaskIds = [];
        
        for (const subtask of subtasks) {
          if (subtask.title && subtask.title.trim()) {
            const createdSubtask = await Task.create({
              title: subtask.title.trim(),
              description: subtask.description || '',
              deadline: new Date(deadline),
              userId: assignedUserId,
              createdBy: userId,
              priority: priority || 'medium',
              isSubtask: true,
              parentTask: newTask._id,
            });
            subtaskIds.push(createdSubtask._id);
          }
        }

        // Update the main task with subtask references
        if (subtaskIds.length > 0) {
          await Task.findByIdAndUpdate(newTask._id, {
            subtasks: subtaskIds
          });
        }
      }

      // Return the created task with populated subtasks
      const populatedTask = await Task.findById(newTask._id)
        .populate({
          path: 'subtasks',
          populate: [
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'userId', select: 'firstName lastName email' }
          ]
        })
        .populate('createdBy', 'firstName lastName email')
        .populate('userId', 'firstName lastName email');

      res.status(201).json(populatedTask);
    } catch (error) {
      console.error("Error creating task:", error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      if (error instanceof Error && error.name === 'CastError') {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      res.status(500).json({ 
        message: "Failed to create task.", 
        error: (error as Error).message 
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
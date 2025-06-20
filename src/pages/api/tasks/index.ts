// src/pages/api/tasks/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import Task from "@/db/models/taskModel"; // Import your new Task model
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { Types } from "mongoose"; // Import Types for ObjectId

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // --- Authentication Middleware (copied from your example) ---
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

  if (req.method === "GET") {
    try {
      // Only return tasks assigned to the authenticated user, and populate createdBy and userId
      const tasks = await Task.find({ userId })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'firstName lastName email')
        .populate('userId', 'firstName lastName email');
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks.", error: (error as Error).message });
    }
  } else if (req.method === "POST") {
    const { title, description, deadline, assignedTo, important } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ message: "Title and deadline are required." });
    }

    try {
      // Assign to selected user if provided, otherwise to the authenticated user
      const assignedUserId = assignedTo ? Types.ObjectId.createFromHexString(assignedTo) : userId;
      const newTask = await Task.create({
        title,
        description,
        deadline: new Date(deadline), // Convert deadline string to Date object
        userId: assignedUserId, // Assign the task to the selected user
        createdBy: userId, // Add this line!
        important: !!important, // <-- Add this
      });
      res.status(201).json(newTask); // 201 Created
    } catch (error) {
      console.error("Error creating task:", error);
      // Mongoose validation errors
      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create task.", error: (error as Error).message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
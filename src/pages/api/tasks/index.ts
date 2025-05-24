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
      const tasks = await Task.find({ userId }).sort({ createdAt: -1 }); // Find tasks for this user, sort newest first
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks.", error: (error as Error).message });
    }
  } else if (req.method === "POST") {
    const { title, description, deadline } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ message: "Title and deadline are required." });
    }

    try {
      const newTask = await Task.create({
        title,
        description,
        deadline: new Date(deadline), // Convert deadline string to Date object
        userId: userId, // Assign the task to the authenticated user
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
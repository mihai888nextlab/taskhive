// src/pages/api/complete-task.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import taskModel from "@/db/models/taskModel"; // Adjust the path if necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "POST") {
    const { taskId } = req.body;

    try {
      // Update the task to mark it as completed
      const updatedTask = await taskModel.findByIdAndUpdate(
        taskId,
        { completed: true },
        { new: true } // Return the updated document
      );

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Error completing task" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
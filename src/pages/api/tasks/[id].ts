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
    try {
      const { completed, title, description, deadline, assignedTo, priority, ...otherUpdates } = req.body;
      
      // Get the current task to check if it's a subtask and preserve subtasks
      const currentTask = await Task.findById(taskId);
      if (!currentTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Prepare update data
      const updateData: any = { ...otherUpdates };
      
      // Handle completion status
      if (completed !== undefined) {
        updateData.completed = completed;
      }
      
      // Handle other field updates (only if this is a full task edit, not just completion toggle)
      if (title !== undefined) {
        updateData.title = title;
      }
      if (description !== undefined) {
        updateData.description = description;
      }
      
      // Handle deadline update with cascading to subtasks
      let deadlineChanged = false;
      if (deadline !== undefined) {
        const newDeadline = new Date(deadline);
        updateData.deadline = newDeadline;
        
        // Check if deadline actually changed
        const currentDeadline = new Date(currentTask.deadline);
        deadlineChanged = newDeadline.getTime() !== currentDeadline.getTime();
      }
      
      if (assignedTo !== undefined) {
        updateData.userId = assignedTo && assignedTo.trim() 
          ? Types.ObjectId.createFromHexString(assignedTo) 
          : currentTask.createdBy;
      }
      if (priority !== undefined) {
        updateData.priority = priority;
      }

      // IMPORTANT: Preserve existing subtasks array for parent tasks
      if (!currentTask.isSubtask && currentTask.subtasks && currentTask.subtasks.length > 0) {
        updateData.subtasks = currentTask.subtasks; // Keep existing subtasks
      }

      // Update the main task
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true }
      ).populate('createdBy', 'firstName lastName email')
       .populate('userId', 'firstName lastName email')
       .populate({
         path: 'subtasks',
         populate: [
           { path: 'createdBy', select: 'firstName lastName email' },
           { path: 'userId', select: 'firstName lastName email' }
         ]
       });

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // CASCADE DEADLINE UPDATE TO SUBTASKS
      if (deadlineChanged && !currentTask.isSubtask && currentTask.subtasks && currentTask.subtasks.length > 0) {
        console.log(`Updating deadline for ${currentTask.subtasks.length} subtasks of task ${taskId}`);
        
        try {
          await Task.updateMany(
            { _id: { $in: currentTask.subtasks } },
            { deadline: updateData.deadline }
          );
          console.log(`Successfully updated deadline for subtasks of task ${taskId}`);
        } catch (subtaskError) {
          console.error(`Error updating subtask deadlines for task ${taskId}:`, subtaskError);
          // Continue execution - this is not a critical failure
        }
      }

      // If this is a subtask that was just completed or uncompleted, 
      // check if we need to update the parent task
      if (currentTask.isSubtask && currentTask.parentTask && completed !== undefined) {
        await checkAndUpdateParentTaskCompletion(currentTask.parentTask);
      }

      // If this is a main task and we're trying to mark it as incomplete,
      // also mark all its subtasks as incomplete
      if (!currentTask.isSubtask && completed === false && currentTask.subtasks && currentTask.subtasks.length > 0) {
        await Task.updateMany(
          { _id: { $in: currentTask.subtasks } },
          { completed: false }
        );
      }

      // Re-fetch the updated task with populated subtasks to return the latest data
      const finalTask = await Task.findById(taskId)
        .populate('createdBy', 'firstName lastName email')
        .populate('userId', 'firstName lastName email')
        .populate({
          path: 'subtasks',
          populate: [
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'userId', select: 'firstName lastName email' }
          ]
        });

      res.status(200).json(finalTask);
    } catch (error) {
      console.error("Error updating task:", error);
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

async function checkAndUpdateParentTaskCompletion(parentTaskId: any) {
  try {
    // Get the parent task with all its subtasks
    const parentTask = await Task.findById(parentTaskId).populate('subtasks');
    
    if (!parentTask || !parentTask.subtasks || parentTask.subtasks.length === 0) {
      return;
    }

    // Check if all subtasks are completed
    const allSubtasksCompleted = parentTask.subtasks.every((subtask: any) => subtask.completed);
    
    // Update parent task completion status if needed
    if (allSubtasksCompleted && !parentTask.completed) {
      await Task.findByIdAndUpdate(parentTaskId, { completed: true });
      console.log(`Parent task ${parentTaskId} automatically marked as completed`);
    } else if (!allSubtasksCompleted && parentTask.completed) {
      await Task.findByIdAndUpdate(parentTaskId, { completed: false });
      console.log(`Parent task ${parentTaskId} automatically marked as incomplete`);
    }
  } catch (error) {
    console.error('Error updating parent task completion:', error);
  }
}
// src/db/models/taskModel.ts

import mongoose, { Schema, Document, Types } from "mongoose";

// Define the Task interface for TypeScript
export interface ITask extends Document {
  title: string;
  description?: string; // Optional
  deadline: Date;
  completed: boolean;
  userId: Types.ObjectId; // Link to the User model
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  important: boolean;
  // Subtask fields
  parentTask?: Types.ObjectId; // Reference to parent task if this is a subtask
  isSubtask: boolean; // Flag to identify subtasks
  subtasks?: Types.ObjectId[]; // Array of subtask IDs
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, "Task deadline is required"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference the 'User' model
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    important: {
      type: Boolean,
      default: false,
    },
    // Subtask fields
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    isSubtask: {
      type: Boolean,
      default: false,
    },
    subtasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Mongoose automatically pluralizes the model name to find the collection (e.g., 'Task' -> 'tasks')
const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
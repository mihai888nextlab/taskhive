// src/db/models/taskModel.ts

import mongoose, { Schema, Document, Types } from "mongoose";

// Define the Task interface for TypeScript
export interface ITask extends Document {
  title: string;
  description?: string;
  deadline: Date;
  completed: boolean;
  userId: Types.ObjectId; // Link to the User model (assignee)
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId; // Assigner
  priority: "critical" | "high" | "medium" | "low";
  // Subtask fields
  parentTask?: Types.ObjectId;
  isSubtask: boolean;
  subtasks?: Types.ObjectId[];
  // RAG specific fields
  pageContent?: string; // The text that will be embedded
  embedding?: number[]; // The vector embedding
  metadata?: {
    // Additional info for the LLM/UI
    source: string; // e.g., 'task'
    originalId: mongoose.Types.ObjectId; // The _id of this task
    title?: string;
    status?: string;
    // ... any other relevant task-specific info
  };
  tags?: string[]; // <-- Add this line
  assignedTo?: Types.ObjectId; // Assignee (for both main tasks and subtasks)
  assignedBy?: Types.ObjectId; // Assigner (for both main tasks and subtasks)
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
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company", // Optional reference to the 'Company' model
      required: true, // Not required for all tasks
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
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
    // RAG specific fields
    pageContent: { type: String },
    embedding: { type: [Number] },
    metadata: { type: mongoose.Schema.Types.Mixed },
    tags: [{ type: String }], // <-- Add this line
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // Used for both main tasks and subtasks
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // Used for both main tasks and subtasks
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose automatically pluralizes the model name to find the collection (e.g., 'Task' -> 'tasks')
const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;

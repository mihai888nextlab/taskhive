// src/db/models/taskModel.ts

import mongoose, { Schema, Document, Types } from "mongoose";

// Define the Task interface for TypeScript
export interface ITask extends Document {
  title: string;
  description?: string;
  deadline: Date;
  completed: boolean;
  userId: Types.ObjectId; // Link to the User model
  companyId: Types.ObjectId; // Optional link to the Company model
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  priority: 'critical' | 'high' | 'medium' | 'low';
  // Subtask fields
  parentTask?: Types.ObjectId;
  isSubtask: boolean;
  subtasks?: Types.ObjectId[];
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
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
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
    timestamps: true,
  }
);

// Mongoose automatically pluralizes the model name to find the collection (e.g., 'Task' -> 'tasks')
const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;

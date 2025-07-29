

import mongoose, { Schema, Document, Types } from "mongoose";


export interface ITask extends Document {
  title: string;
  description?: string;
  deadline: Date;
  completed: boolean;
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  priority: "critical" | "high" | "medium" | "low";
  
  parentTask?: Types.ObjectId;
  isSubtask: boolean;
  subtasks?: Types.ObjectId[];
  pageContent?: string;
  embedding?: number[];
  metadata?: {
    source: string;
    originalId: mongoose.Types.ObjectId;
    title?: string;
    status?: string;
  };
  tags?: string[];
  assignedTo?: Types.ObjectId;
  assignedBy?: Types.ObjectId;
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
      ref: "Company",
      required: true,
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
    
    pageContent: { type: String },
    embedding: { type: [Number] },
    metadata: { type: mongoose.Schema.Types.Mixed },
    tags: [{ type: String }],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      
    },
  },
  {
    timestamps: true,
  }
);


const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;

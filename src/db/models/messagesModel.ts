import mongoose from "mongoose";
const { Schema } = mongoose;

export interface IMessages extends mongoose.Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "image" | "file";
  createdAt: Date;
  updatedAt: Date;
}

const messagesSchema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversations",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Messages ||
  mongoose.model("Messages", messagesSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

export interface IConversation extends mongoose.Document {
  type: "direct" | "group" | "project";
  participants: mongoose.Types.ObjectId[];
  companyId: mongoose.Types.ObjectId;
  name?: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group", "project"],
      default: "direct",
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: { type: String },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Conversations ||
  mongoose.model("Conversations", conversationsSchema);

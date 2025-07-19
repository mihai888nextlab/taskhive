// backend/db/models/messagesModel.js
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const messagesModel =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
module.exports = messagesModel;

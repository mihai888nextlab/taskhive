const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const ConversationsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group", "project"],
      default: "direct",
    },
    participants: [{ type: Types.ObjectId, ref: "User" }],
    companyId: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: { type: String },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const conversationsModel =
  mongoose.models.Conversations ||
  mongoose.model("Conversations", ConversationsSchema);
module.exports = conversationsModel;

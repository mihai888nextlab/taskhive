// backend/db/models/messagesModel.js
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const profileImageSchema = new Schema(
  {
    data: { type: String, required: true }, // base64 string
    contentType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    fileName: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profileImage: { type: profileImageSchema, default: null },
    skills: { type: [String], default: [] },
    description: { type: String, default: "" },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const usersModel = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = usersModel;

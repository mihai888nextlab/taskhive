import mongoose from "mongoose";
const { Schema } = mongoose;

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: {
    data: string;
    contentType: string;
    uploadedAt: Date;
    fileName?: string;
  };
  googleId?: string; // <-- Add this line
}

const profileImageSchema = new Schema(
  {
    data: { type: String, required: true }, // base64 string
    contentType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    fileName: { type: String },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profileImage: { type: profileImageSchema, default: null },
    skills: { type: [String], default: [] },
    description: { type: String, default: "" },
    googleId: { type: String, default: null }, // <-- Add this line
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

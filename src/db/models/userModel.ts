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
    data: string; // base64 or Buffer if you want
    contentType: string;
    uploadedAt: Date;
    fileName?: string;
  };
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
    skills: { type: [String], default: [] }, // <-- Add this line
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

export interface IUser extends mongoose.Document {
  email: string;
  password: string; // Store hashed password
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

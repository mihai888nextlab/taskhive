import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
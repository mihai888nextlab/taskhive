import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  companyId: mongoose.Types.ObjectId;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);

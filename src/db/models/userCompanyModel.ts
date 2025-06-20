import Company from './companyModel'; // <-- This import is REQUIRED and must be at the top!
import mongoose from "mongoose";
const { Schema } = mongoose;

const userCompanySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    role: { type: String, required: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

userCompanySchema.index({ userId: 1, companyId: 1 }, { unique: true });

export default mongoose.models.UserCompany ||
  mongoose.model("UserCompany", userCompanySchema);
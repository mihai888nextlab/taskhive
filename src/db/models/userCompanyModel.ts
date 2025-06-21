import Company from './companyModel';
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
    departmentId: { type: String, required: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

userCompanySchema.index({ userId: 1, companyId: 1 }, { unique: true });

// **Force model refresh**
delete mongoose.models.UserCompany;

export default mongoose.models.UserCompany ||
  mongoose.model("UserCompany", userCompanySchema);
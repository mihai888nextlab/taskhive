import mongoose from "mongoose";
const { Schema } = mongoose;

const companySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    registrationNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Company ||
  mongoose.model("Company", companySchema);

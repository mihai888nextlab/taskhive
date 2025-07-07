import mongoose from "mongoose";
const { Schema } = mongoose;

export interface ISignature extends mongoose.Document {
  signatureName: string;
  signatureUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const signatureSchema = new Schema(
  {
    signatureName: {
      type: String,
      required: true,
    },
    signatureUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Signature || mongoose.model("Signature", signatureSchema);
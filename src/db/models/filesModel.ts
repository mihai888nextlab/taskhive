import mongoose from "mongoose";
const { Schema } = mongoose;

export interface IFiles extends mongoose.Document {
  fileName: string;
  fileLocation: string;
  uploadedBy: mongoose.Types.ObjectId;
}

const filesSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileLocation: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
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

export default mongoose.models.Files || mongoose.model("Files", filesSchema);

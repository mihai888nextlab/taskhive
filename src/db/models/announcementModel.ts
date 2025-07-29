import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  pinned: boolean;
  expiresAt?: Date;
  eventDate?: Date;
  comments?: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  pageContent?: string;
  embedding?: number[];
  metadata?: {
    source: string;
    originalId: mongoose.Types.ObjectId;
    title?: string;
    status?: string;
  };
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    category: {
      type: String,
      enum: ["Update", "Event", "Alert"],
      required: true,
    },
    eventDate: {
      type: Date,
      required: function(this: IAnnouncement) {
        return this.category === "Event";
      },
    },
    pinned: { type: Boolean, default: false },
    expiresAt: { type: Date },
    
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    
    pageContent: { type: String },
    embedding: { type: [Number] },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const AnnouncementModel =
  models.Announcement ||
  model<IAnnouncement>("Announcement", AnnouncementSchema);

export default AnnouncementModel;

import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  pinned: boolean;
  expiresAt?: Date;
  comments?: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ["Update", "Event", "Alert"], required: true },
  pinned: { type: Boolean, default: false },
  expiresAt: { type: Date },
  // Optionally, for comments:
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const AnnouncementModel = models.Announcement || model<IAnnouncement>('Announcement', AnnouncementSchema);

export default AnnouncementModel;
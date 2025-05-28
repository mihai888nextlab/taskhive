import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const AnnouncementModel = models.Announcement || model<IAnnouncement>('Announcement', AnnouncementSchema);

export default AnnouncementModel; 
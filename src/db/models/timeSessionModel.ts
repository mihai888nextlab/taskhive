import mongoose from 'mongoose';

export interface ITimeSession extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  duration: number;
  createdAt: Date;
  cycles?: number;
}

const timeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  tag: { type: String, default: "General" },
  cycles: { type: Number, default: 1 },
});

const TimeSession = mongoose.models.TimeSession || mongoose.model('TimeSession', timeSessionSchema);

export default TimeSession;
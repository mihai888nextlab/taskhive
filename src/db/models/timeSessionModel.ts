import mongoose from 'mongoose';

export interface ITimeSession extends mongoose.Document {
  userId: mongoose.Types.ObjectId; // Reference to the user
  name: string; // Name of the session
  description: string; // Description of the session
  duration: number; // Duration in seconds
  createdAt: Date; // Timestamp of when the session was created
}

const timeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Check if the model already exists to avoid overwriting
const TimeSession = mongoose.models.TimeSession || mongoose.model('TimeSession', timeSessionSchema);

export default TimeSession;
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/db/dbConfig';
import TimeSession, { ITimeSession } from '@/db/models/timeSessionModel';
import mongoose from 'mongoose'; // <-- Add this

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Ensure the database is connected

  if (req.method === 'POST') {
    let { userId, name, description, duration, tag, cycles } = req.body; // <-- add tag

    // Convert userId to ObjectId if it's a string
    if (typeof userId === "string") {
      try {
        userId = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid userId format' });
      }
    }

    console.log("Received data:", { userId, name, description, duration, tag, cycles }); // Log received data

    if (!userId || !name || duration === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newSession = new TimeSession({
      userId,
      name,
      description,
      duration,
      tag, // <-- add tag
      cycles, // <-- add this
    });

    try {
      const savedSession = await newSession.save();
      return res.status(201).json(savedSession);
    } catch (error) {
      console.error("Error saving session:", error);
      return res.status(500).json({ message: 'Failed to save session', error });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      const sessions = await TimeSession.find({ userId }).exec();
      return res.status(200).json(sessions);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch sessions', error });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query; // Assuming the session ID is passed as a query parameter

    if (!id) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    try {
      await TimeSession.findByIdAndDelete(id); // Delete the session by ID
      return res.status(204).end(); // No content to return
    } catch (error) {
      console.error("Error deleting session:", error);
      return res.status(500).json({ message: 'Failed to delete session', error });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

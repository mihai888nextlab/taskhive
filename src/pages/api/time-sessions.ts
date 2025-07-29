import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import TimeSession from "@/db/models/timeSessionModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "POST") {
    const { userId, name, description, duration, tag, cycles } = req.body || {};
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        message: typeof userId !== "string" ? "Invalid userId format" : "User ID is required",
      });
    }
    if (!name || duration === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      const session = new (TimeSession as any)({ userId, name, description, duration, tag, cycles });
      await session.save();
      return res.status(201).json(session);
    } catch (err) {
      return res.status(500).json({ message: "Failed to create session" });
    }
  } else if (req.method === "GET") {
    let userId = (req.query as any).userId;
    if (Array.isArray(userId)) userId = userId[0];
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "User ID is required" });
    }
    try {
      const sessions = await (TimeSession as any).find({ userId }).exec();
      return res.status(200).json(sessions);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch sessions" });
    }
  } else if (req.method === "DELETE") {
    let id = (req.query as any).id;
    if (Array.isArray(id)) id = id[0];
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Session ID is required" });
    }
    try {
      await (TimeSession as any).findByIdAndDelete(id);
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ message: "Failed to delete session" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

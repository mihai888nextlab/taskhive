import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import conversationModel from "@/db/models/conversationsModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  const { chatId } = req.query;

  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ message: "Missing or invalid chatId" });
  }

  try {
    const conversation = await conversationModel
      .findById(chatId)
      .select("name")
      .exec();
    if (!conversation) {
      return res.status(404).json({ message: "Chat not found" });
    }
    return res.status(200).json({ name: conversation.name });
  } catch (error) {
    console.error("Error fetching chat name:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

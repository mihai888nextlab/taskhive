import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import messagesModel from "@/db/models/messagesModel";
import { JWTPayload } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { conversationId } = req.query;

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decodedToken: JWTPayload | null = jwt.verify(
    token,
    process.env.JWT_SECRET || ""
  ) as JWTPayload;

  if (!decodedToken || !decodedToken.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      // TODO: Verify if the session user is a participant of this conversationId
      // You'll need to fetch the conversation and check its participants array.
      // If not authorized, return 403 Forbidden.

      const messages = await messagesModel
        .find({ conversationId })
        .sort({ timestamp: 1 }) // Oldest first
        .limit(50) // Limit number of messages
        .populate("senderId", "firstName lastName email") // Populate sender details for display
        .exec();

      const transformedMessages = messages.map((msg: any) => {
        const obj = msg.toObject();
        return {
          ...obj,
          timestamp: obj.createdAt,
        };
      });

      res.status(200).json({ messages: transformedMessages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

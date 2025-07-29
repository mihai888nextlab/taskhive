import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import conversationsModel from "@/db/models/conversationsModel";
import { Types } from "mongoose";
import { JWTPayload } from "@/types";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

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

  const currentUserId = decodedToken.userId;

  if (req.method === "GET") {
    try {
      const conversations = await conversationsModel
        .find({
          participants: { $in: [new Types.ObjectId(currentUserId)] },
          companyId: decodedToken.companyId,
        })
        .populate("participants", "firstName lastName email")
        .sort({ updatedAt: -1 })
        .exec();

      res.status(200).json({ conversations });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  else if (req.method === "POST") {
    const { type, participants, name } = req.body;

    const allParticipants = Array.from(
      new Set([...participants, currentUserId])
    );

    if (
      !type ||
      !allParticipants ||
      allParticipants.length < (type === "direct" ? 2 : 2)
    ) {
      return res.status(400).json({
        message: "Missing required fields or insufficient participants.",
      });
    }
    if (type === "group" && !name) {
      return res.status(400).json({ message: "Group chat requires a name." });
    }

    try {
      if (type === "direct" && allParticipants.length === 2) {
        const existingDirectConvo = await conversationsModel.findOne({
          type: "direct",
          participants: {
            $all: allParticipants.map((id) => new Types.ObjectId(id)),
            $size: 2,
          },
        });

        if (existingDirectConvo) {
          return res.status(200).json({
            message: "Conversation already exists",
            conversationId: existingDirectConvo._id,
          });
        }
      }

      const newConversation = new conversationsModel({
        type,
        participants: allParticipants.map((id) => new Types.ObjectId(id)),
        companyId: decodedToken.companyId,
        name: type === "group" ? name : undefined,
      });

      await newConversation.save();
      res.status(201).json({
        message: "Conversation created successfully",
        conversationId: newConversation._id,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

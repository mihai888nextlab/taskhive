import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import { Invitation } from "@/db/models/invitationModel";
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

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

  try {
    const now = new Date();
    const invitations = await Invitation.find({
      companyId: decodedToken.companyId, // Filter by companyId
      status: "pending", // Only pending invitations
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } }, // Not expired
      ],
    })
      .populate("companyId", "name") // Populate company name
      .exec();

    return res.status(200).json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

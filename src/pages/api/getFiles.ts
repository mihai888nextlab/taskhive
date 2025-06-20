import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import filesModel from "@/db/models/filesModel";
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

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "File ID required" });
    }
    try {
      await filesModel.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete file" });
    }
  }

  if (req.method === "PATCH") {
    const { id, newName } = req.body;
    if (!id || !newName) {
      return res.status(400).json({ message: "File ID and new name required" });
    }
    try {
      const updated = await filesModel.findByIdAndUpdate(id, { fileName: newName });
      return res.status(200).json({ success: true, file: updated });
    } catch (error) {
      return res.status(500).json({ message: "Failed to rename file" });
    }
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const files = await filesModel
      .find({ uploadedBy: decodedToken.userId })
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

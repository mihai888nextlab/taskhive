import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import signatureModel from "@/db/models/signatureModel";
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

  if (req.method === "GET") {
    try {
      const signatures = await signatureModel
        .find({ uploadedBy: decodedToken.userId })
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).json({ signatures });
    } catch (error) {
      console.error("Error fetching signatures:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    const { signatureName, signatureUrl } = req.body;
    
    if (!signatureName || !signatureUrl) {
      return res.status(400).json({ message: "Signature name and URL required" });
    }

    try {
      const newSignature = await signatureModel.create({
        signatureName,
        signatureUrl,
        uploadedBy: decodedToken.userId,
      });
      res.status(201).json({ signature: newSignature });
    } catch (error) {
      console.error("Error creating signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Signature ID required" });
    }
    try {
      await signatureModel.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete signature" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
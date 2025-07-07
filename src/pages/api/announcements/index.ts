import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import AnnouncementModel from "@/db/models/announcementModel";
import UserModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import * as cookie from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No auth token" });
  }

  let decoded: JwtPayload | null = null;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (!decoded || !decoded.userId) {
    return res.status(401).json({ message: "Invalid token payload" });
  }

  let user = await UserModel.findById(decoded.userId);
  let userCompany = null;
  if (user) {
    userCompany = await userCompanyModel.findOne({
      userId: user._id,
      companyId: decoded.companyId,
    });
  }

  // const companyUserRecords = await userCompanyModel
  //   .find({ companyId: decoded.companyId })
  //   .select("userId")
  //   .lean();

  // const companyUserIds = companyUserRecords.map((record) => record.userId);

  if (req.method === "GET") {
    // Anyone can view announcements
    const announcements = await AnnouncementModel.find({
      companyId: decoded.companyId,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName email");
    return res.status(200).json(announcements);
  }

  if (req.method === "POST") {
    // Only admin can create
    if (
      !user ||
      !userCompany ||
      (userCompany.role || "").toLowerCase() !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Only admins can create announcements." });
    }
    const { title, content, category, pinned, expiresAt } = req.body;
    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ message: "Title, content, and category are required." });
    }
    try {
      const announcement = await AnnouncementModel.create({
        title,
        content,
        category,
        pinned: !!pinned,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        createdBy: user._id,
        companyId: decoded.companyId,
      });
      await announcement.populate("createdBy", "firstName lastName email");
      return res.status(201).json(announcement);
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "Failed to create announcement.",
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

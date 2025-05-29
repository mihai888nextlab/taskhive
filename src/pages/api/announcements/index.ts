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
    userCompany = await userCompanyModel.findOne({ userId: user._id });
  }

  const companyUserRecords = await userCompanyModel
    .find({ companyId: decoded.companyId })
    .select("userId")
    .lean();

  const companyUserIds = companyUserRecords.map((record) => record.userId);

  if (req.method === "GET") {
    // Anyone can view announcements
    const announcements = await AnnouncementModel.find({
      createdBy: { $in: companyUserIds },
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
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }
    const announcement = await AnnouncementModel.create({
      title,
      content,
      createdBy: user._id,
    });
    await announcement.populate("createdBy", "firstName lastName email");
    return res.status(201).json(announcement);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

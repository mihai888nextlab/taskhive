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

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

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

  if (
    !user ||
    !userCompany ||
    (userCompany.role || "").toLowerCase() !== "admin"
  ) {
    return res
      .status(403)
      .json({ message: "Only admins can pin/unpin announcements." });
  }

  const { id } = req.query;
  const { pinned } = req.body;

  if (typeof pinned !== "boolean") {
    return res.status(400).json({ message: "Pinned value must be boolean." });
  }

  try {
    const announcement = await AnnouncementModel.findByIdAndUpdate(
      id,
      { pinned },
      { new: true }
    ).populate("createdBy", "firstName lastName email");
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }
    return res.status(200).json(announcement);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to update pin status." });
  }
}

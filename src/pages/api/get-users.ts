import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userCompanyModel from "@/db/models/userCompanyModel";
import dbConnect from "@/db/dbConfig";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const users = await userCompanyModel
      .find({
        companyId: decodedToken.companyId,
      })
      .populate({
        path: "userId",
        select: "-password",
      })
      .lean();

    const mappedUsers = users.map((u) => ({
      _id: u._id,
      userId: {
        _id: u.userId._id,
        email: u.userId.email,
        firstName: u.userId.firstName,
        lastName: u.userId.lastName,
        profileImage: u.userId.profileImage || null,
        description: u.userId.description || "",
        skills: u.userId.skills || [],
      },
      companyId: u.companyId,
      role: u.role,
      permissions: u.permissions,
    }));

    const companyMemberCounts = await userCompanyModel.aggregate([
      { $group: { _id: "$companyId", members: { $sum: 1 } } }
    ]);

    return res.status(200).json({ users: mappedUsers, memberCounts: companyMemberCounts });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (decoded.role !== "admin") {
    return res.status(403).json({ message: "Only admins can update roles" });
  }

  const { userId, role } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ message: "userId and role required" });
  }

  try {
    const userCompany = await userCompanyModel.findOneAndUpdate(
      { userId, companyId: decoded.companyId },
      { role },
      { new: true }
    );
    if (!userCompany) return res.status(404).json({ message: "UserCompany not found" });

    const user = await userModel.findById(userId).select("-password").lean();
    res.status(200).json({ message: "Role updated", user: { ...user, role: userCompany.role } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

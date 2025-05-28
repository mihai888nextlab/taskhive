import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import dbConnect from "@/db/dbConfig";
import User from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No auth token" });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "");
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Find the user in the database
  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Fetch user's role from userCompanyModel
  const userCompany = await userCompanyModel.findOne({
    userId: decoded.userId,
  });

  if (!userCompany) {
    return res.status(404).json({ message: "UserCompany not found" });
  }

  // Return the current user's info, including role
  res.status(200).json({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: userCompany.role || null,
  });
} 
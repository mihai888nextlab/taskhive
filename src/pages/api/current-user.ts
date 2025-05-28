import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import dbConnect from "@/db/dbConfig";
import User from "@/db/models/userModel";

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

  // Return only the current user's info
  res.status(200).json({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
} 
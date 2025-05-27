// pages/api/user.ts
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload, User } from "@/types";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel"; // Import userCompanyModel

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
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

  if (!decodedToken) {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: -1,
        path: "/",
      })
    );
    return res.status(402).json({ message: "Invalid or expired token" });
  }

  try {
    // Fetch user from userModel
    const user = await userModel
      .findOne({
        _id: decodedToken.userId,
        email: decodedToken.email,
      })
      .select("-password")
      .lean(); // Use lean() for better performance

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's role from userCompanyModel
    const userCompany = await userCompanyModel.findOne({
      userId: decodedToken.userId,
    });

    if (!userCompany) {
      return res.status(404).json({ message: "UserCompany not found" });
    }

    // Combine user data and role
    const userWithRole = {
      ...user,
      role: userCompany.role,
    };

    return res.status(200).json({ user: userWithRole });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
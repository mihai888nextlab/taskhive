import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload, User } from "@/types";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import dbConnect from "@/db/dbConfig";
import taskModel from "@/db/models/taskModel";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
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

    const users = await userCompanyModel
      .find({
        companyId: decodedToken.companyId,
      })
      .populate("userId", "firstName lastName email profileImage description");

    const mappedUsers = users.map((u) => ({
      _id: u._id,
      userId: {
        _id: u.userId._id,
        email: u.userId.email,
        firstName: u.userId.firstName,
        lastName: u.userId.lastName,
        profileImage: u.userId.profileImage || null,
        description: u.userId.description || "",
      },
      companyId: u.companyId,
      role: u.role,
      permissions: u.permissions,
    }));

    return res.status(200).json({ users: mappedUsers });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

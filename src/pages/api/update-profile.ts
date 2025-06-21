import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { JWTPayload } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API HIT /api/update-profile");

  await dbConnect();
  console.log("DB Connected");

  // Allow only POST requests
  if (req.method !== "POST") {
    console.log("Wrong method:", req.method);
    return res.status(405).end();
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    console.log("No token");
    return res.status(401).json({ message: "No token" });
  }

  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
    console.log("JWT decoded:", decoded);
  } catch (err) {
    console.log("JWT error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const { firstName, lastName, description } = req.body;
    console.log("Updating user:", decoded.userId, firstName, lastName);

    // Build update object only with non-empty fields
    const updateFields: Record<string, any> = {};
    if (firstName && firstName.trim() !== "") updateFields.firstName = firstName;
    if (lastName && lastName.trim() !== "") updateFields.lastName = lastName;
    if (typeof description === "string") updateFields.description = description;

    const updatedUser = await userModel
      .findByIdAndUpdate(
        decoded.userId,
        updateFields,
        { new: true }
      )
      .select("-password");

    if (!updatedUser) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User updated:", updatedUser);
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
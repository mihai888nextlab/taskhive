import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig"; // Import the database connection utility
import User from "@/db/models/userModel"; // Import the Mongoose user model
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the database is connected
  await dbConnect();

  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName } = req.body;

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken: JWTPayload | null = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;

    // Find the user by ID and update their profile
    const updatedUser = await User.findOneAndUpdate(
      { _id: decodedToken.userId }, // Find the user by ID
      { firstName, lastName }, // Update fields
      { new: true, runValidators: true } // Return the updated document and validate inputs
    );

    // If no user is found, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with success
    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
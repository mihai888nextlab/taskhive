import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { parse } from "cookie"; // Parse cookies from the request header
import dbConnect from "@/db/dbConfig"; // Import the database connection utility
import User from "@/db/models/userModel"; // Import the Mongoose user model

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key"; // Replace with your actual secret key

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Ensure the database is connected
      await dbConnect();

      // Parse cookies from the request
      const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
      const token = cookies.auth_token; // Use the same cookie name as in update-profile.ts

      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      // Verify the token
      const decoded = jwt.verify(token, SECRET_KEY) as { email: string; userId: string };

      // Fetch user data from the database using the decoded userId
      const user = await User.findById(decoded.userId).select("email password createdAt firstName lastName");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Respond with user details, including the plaintext password
      res.status(200).json({
        email: user.email,
        password: user.password, // This assumes the password is stored in plaintext
        createdAt: user.createdAt,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Error fetching account details:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: "Method not allowed" });
  }
}
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import dbConnect from "@/db/dbConfig";
import User from "@/db/models/userModel";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await dbConnect();

      const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
      const token = cookies.auth_token;

      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, SECRET_KEY) as { email: string; userId: string };

      const user = await User.findById(decoded.userId).select("email password createdAt firstName lastName");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        email: user.email,
        password: user.password,
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
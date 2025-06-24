import { NextApiRequest, NextApiResponse } from "next";
import userModel from "@/db/models/userModel";
import dbConnect from "@/db/dbConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const users = await userModel.find({}).select("-password").lean();
    // Each user will have .skills if present in DB
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
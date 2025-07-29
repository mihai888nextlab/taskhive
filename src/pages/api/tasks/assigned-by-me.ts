import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import Task from "@/db/models/taskModel";
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { Types } from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication required: No token provided" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authentication required: Invalid token" });
  }

  const userId = new Types.ObjectId(decodedToken.userId);

  if (req.method === "GET") {
    try {
      // Return all tasks where createdBy is the current user, populate userId (assignee), and exclude self-assigned tasks
      const tasks = await Task.find({
        createdBy: userId,
        companyId: decodedToken.companyId,
        $expr: { $ne: ["$userId", "$createdBy"] },
        $or: [{ isSubtask: { $exists: false } }, { isSubtask: false }],
      })
        .sort({ createdAt: -1 })
        .populate("userId", "firstName lastName email")
        .populate("createdBy", "firstName lastName email")
        .populate({
          path: "subtasks",
          populate: [
            { path: "createdBy", select: "firstName lastName email" },
            { path: "userId", select: "firstName lastName email" },
          ],
        });
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      res
        .status(500)
        .json({
          message: "Failed to fetch assigned tasks.",
          error: (error as Error).message,
        });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

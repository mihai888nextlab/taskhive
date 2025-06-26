import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import taskModel from "@/db/models/taskModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import { Types } from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    // Get all userCompany records for this company
    const companyUserRecords = await userCompanyModel
      .find({ companyId: decodedToken.companyId })
      .select("userId createdAt")
      .lean();

    const companyUserIds = companyUserRecords.map(
      (record) => new Types.ObjectId(record.userId)
    );

    // Total users in company
    const totalUsers = companyUserRecords.length;

    // New users in last 7 days (based on userCompany createdAt)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const newUsers = companyUserRecords.filter(
      (u) => u.createdAt && new Date(u.createdAt) >= last7Days
    ).length;

    // Total tasks assigned to or created by users in this company
    const totalTasks = await taskModel.countDocuments({
      $or: [
        { userId: { $in: companyUserIds } },
        { createdBy: { $in: companyUserIds } },
      ],
    });

    // Completed tasks in last 7 days for this company
    const completedTasks = await taskModel.countDocuments({
      $or: [
        { userId: { $in: companyUserIds } },
        { createdBy: { $in: companyUserIds } },
      ],
      completed: true,
      updatedAt: { $gte: last7Days },
    });

    // New users per day for last 7 days (array)
    const newUsersData = Array(7).fill(0);
    companyUserRecords.forEach((u) => {
      if (u.createdAt) {
        const daysAgo = Math.floor(
          (new Date().getTime() - new Date(u.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysAgo < 7) {
          newUsersData[daysAgo]++;
        }
      }
    });

    // Completed tasks per day for last 7 days (array)
    const companyTasks = await taskModel
      .find({
        $or: [
          { userId: { $in: companyUserIds } },
          { createdBy: { $in: companyUserIds } },
        ],
        completed: true,
        updatedAt: { $gte: last7Days },
      })
      .select("updatedAt")
      .lean();

    const completedTasksData = Array(7).fill(0);
    companyTasks.forEach((t) => {
      if (t.updatedAt) {
        const daysAgo = Math.floor(
          (new Date().getTime() - new Date(t.updatedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysAgo < 7) {
          completedTasksData[daysAgo]++;
        }
      }
    });

    res.status(200).json({
      totalUsers,
      newUsers,
      totalTasks,
      completedTasks,
      newUsersData,
      completedTasksData,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import connectDB from "@/db/dbConfig";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import Task from "@/db/models/taskModel";
import ExpenseModel from "@/db/models/expensesModel";
import AnnouncementModel from "@/db/models/announcementModel";
import StorageFileModel from "@/db/models/filesModel";
import TimeSessionModel from "@/db/models/timeSessionModel";
// Add other models as needed

const verifyAuthToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) return null;

  let decodedToken: JWTPayload | null = null;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
  } catch {
    return null;
  }

  if (!decodedToken) return null;

  try {
    const user = await userModel.findOne({
      _id: decodedToken.userId,
      email: decodedToken.email,
    });

    if (!user) return null;

    const userCompany = await userCompanyModel.findOne({
      userId: decodedToken.userId,
    });

    if (!userCompany) return null;

    return {
      ...user._doc,
      role: userCompany.role,
      companyId: userCompany.companyId,
    };
  } catch {
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectDB();

  const authResult = await verifyAuthToken(req, res);
  if (!authResult || !authResult._id || !authResult.companyId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { userId, companyId } = authResult;
  const { q } = req.query;
  const searchTerm = typeof q === "string" ? q.trim() : "";

  if (!searchTerm) {
    return res.status(200).json({ results: [] });
  }

  const regex = new RegExp(searchTerm, "i");
  const results: any = {};

  const companyUserRecords = await userCompanyModel.find({ companyId }).lean();
  const companyUserIds = companyUserRecords.map((u) => u.userId?.toString());

  const searchPromises: Promise<any>[] = [
    // Tasks: assigned to or created by company users
    Task.find({
      $or: [
        { 
          $and: [
            { userId: { $in: companyUserIds } },
            { $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }] }
          ]
        },
        { 
          $and: [
            { createdBy: { $in: companyUserIds } },
            { $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }] }
          ]
        }
      ],
    })
      .limit(5)
      .populate('userId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .lean()
      .then((tasks) => {
        results.tasks = tasks.map((t) => ({ ...t, type: "task" }));
      }),

    // Users (already correct)
    userCompanyModel
      .find({ companyId })
      .populate("userId", "firstName lastName email profileImage description")
      .lean()
      .then((users) => {
        results.users = users
          .filter(
            (u) =>
              (u.userId?.firstName && regex.test(u.userId.firstName)) ||
              (u.userId?.lastName && regex.test(u.userId.lastName)) ||
              (u.userId?.email && regex.test(u.userId.email))
          )
          .slice(0, 5)
          .map((u) => ({
            ...u,
            type: "user",
            fullName: `${u.userId?.firstName || ""} ${u.userId?.lastName || ""}`.trim(),
            email: u.userId?.email,
            firstName: u.userId?.firstName,
            lastName: u.userId?.lastName,
            profileImage: u.userId?.profileImage,
            description: u.userId?.description,
            _id: u.userId?._id,
          }));
      }),

    // Announcements: created by company users
    AnnouncementModel.find({
      createdBy: { $in: companyUserIds },
      $or: [{ title: { $regex: regex } }, { content: { $regex: regex } }],
    })
      .limit(5)
      .populate('createdBy', 'firstName lastName email')
      .lean()
      .then((announcements) => {
        results.announcements = announcements.map((a) => ({
          ...a,
          type: "announcement",
        }));
      }),

    // Storage Files (already correct)
    StorageFileModel.find({
      companyId,
      $or: [
        { fileName: { $regex: regex } },
        { name: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    })
      .limit(5)
      .lean()
      .then((files) => {
        results.storageFiles = files.map((f) => ({
          ...f,
          type: "storage",
        }));
      }),

    // Expenses (already correct)
    ExpenseModel.find({
      companyId,
      type: "expense",
      $or: [
        { description: { $regex: regex } },
        { category: { $regex: regex } },
        { title: { $regex: regex } },
      ],
    })
      .limit(5)
      .lean()
      .then((expenses) => {
        results.expenses = expenses.map((e) => ({ ...e, type: "expense" }));
      }),

    // Incomes (already correct)
    ExpenseModel.find({
      companyId,
      type: "income",
      $or: [
        { description: { $regex: regex } },
        { source: { $regex: regex } },
        { title: { $regex: regex } },
      ],
    })
      .limit(5)
      .lean()
      .then((incomes) => {
        results.incomes = incomes.map((i) => ({ ...i, type: "income" }));
      }),

    // Time Sessions: only for company users
    TimeSessionModel.find({
      userId: { $in: companyUserIds },
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { tag: { $regex: regex } },
      ],
    })
      .limit(5)
      .populate('userId', 'firstName lastName email')
      .lean()
      .then((sessions) => {
        results.timeSessions = sessions.map((ts) => ({
          ...ts,
          type: "timesession",
        }));
      })
  ];

  try {
    await Promise.all(searchPromises);
    return res.status(200).json({ results });
  } catch (error) {
    console.error("Universal search API error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during search" });
  }
}

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
    // --- FIX: Always await, even if mock returns value ---
    let user = userModel.findOne({
      _id: decodedToken.userId,
      email: decodedToken.email,
    });
    if (typeof (user as any)?.then === "function") {
      user = await user;
    }
    if (!user) return null;

    let userCompanyDoc = userCompanyModel.findOne({
      userId: decodedToken.userId,
    });
    if (typeof (userCompanyDoc as any)?.then === "function") {
      userCompanyDoc = await userCompanyDoc;
    }
    if (!userCompanyDoc) return null;

    // --- FIX: Support both ._doc and plain object for test mocks ---
    const userObj = (user as any)?._doc ? (user as any)._doc : user;
    const userCompanyObj = (userCompanyDoc as any)?._doc ? (userCompanyDoc as any)._doc : userCompanyDoc;
    return {
      ...userObj,
      role: userCompanyObj.role,
      companyId: userCompanyObj.companyId,
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

  const { q } = req.query;
  const searchTerm = typeof q === "string" ? q.trim() : "";

  // --- FIX: Move authentication logic AFTER checking for empty search term ---
  if (!searchTerm) {
    return res.status(200).json({ results: [] });
  }

  // Now require authentication for actual search
  const authResult = await verifyAuthToken(req, res);
  if (!authResult || !authResult._id || !authResult.companyId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { userId, companyId } = authResult;

  const regex = new RegExp(searchTerm, "i");
  const results: any = {
    tasks: [],
    users: [],
    announcements: [],
    storageFiles: [],
    expenses: [],
    incomes: [],
    timeSessions: [],
  };

  // --- FIX: Ensure companyUserRecords is always an array ---
  let companyUserRecords = await userCompanyModel.find({ companyId }).lean();
  if (!Array.isArray(companyUserRecords)) {
    companyUserRecords = [];
  }
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
        results.tasks = (tasks || []).map((t: any) => ({ ...t, type: "task" }));
      }),

    // Users
    userCompanyModel
      .find({ companyId })
      .populate("userId", "firstName lastName email profileImage description")
      .lean()
      .then((users) => {
        results.users = (users || [])
          .filter(
            (u: any) =>
              (u.userId?.firstName && regex.test(u.userId.firstName)) ||
              (u.userId?.lastName && regex.test(u.userId.lastName)) ||
              (u.userId?.email && regex.test(u.userId.email))
          )
          .slice(0, 5)
          .map((u: any) => ({
            _id: u.userId?._id ?? u._id,
            userId: u.userId,
            type: "user",
            fullName: `${u.userId?.firstName || ""} ${u.userId?.lastName || ""}`.trim(),
            email: u.userId?.email,
            firstName: u.userId?.firstName,
            lastName: u.userId?.lastName,
            profileImage: u.userId?.profileImage,
            description: u.userId?.description,
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
        results.announcements = (announcements || []).map((a: any) => ({
          ...a,
          type: "announcement",
        }));
      }),

    // Storage Files
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
        results.storageFiles = (files || []).map((f: any) => ({
          ...f,
          type: "storage",
        }));
      }),

    // Expenses
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
        results.expenses = (expenses || []).map((e: any) => ({ ...e, type: "expense" }));
      }),

    // Incomes
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
        results.incomes = (incomes || []).map((i: any) => ({ ...i, type: "income" }));
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
        results.timeSessions = (sessions || []).map((ts: any) => ({
          ...ts,
          type: "timesession",
        }));
      })
  ];

  try {
    await Promise.all(searchPromises);
    // Ensure all result keys are present and are arrays, even if empty
    return res.status(200).json({
      results: {
        tasks: Array.isArray(results.tasks) ? results.tasks : [],
        users: Array.isArray(results.users) ? results.users : [],
        announcements: Array.isArray(results.announcements) ? results.announcements : [],
        storageFiles: Array.isArray(results.storageFiles) ? results.storageFiles : [],
        expenses: Array.isArray(results.expenses) ? results.expenses : [],
        incomes: Array.isArray(results.incomes) ? results.incomes : [],
        timeSessions: Array.isArray(results.timeSessions) ? results.timeSessions : [],
      },
    });
  } catch (error) {
    console.error("Universal search API error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during search" });
  }
}
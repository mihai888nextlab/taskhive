import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConfig";
import OrgChart from "@/db/models/orgChartModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  // 1. Authenticate user
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decodedToken: JWTPayload | null = null;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // 2. Get user's role and departmentId (from JWT or DB)
  let userRole = decodedToken.role;
  let userDepartmentId = decodedToken.departmentId;

  // If missing, fetch from userCompanyModel
  if (!userRole || !userDepartmentId) {
    const userCompany = await userCompanyModel.findOne({
      userId: decodedToken.userId,
    });
    if (!userCompany || !userCompany.role || !userCompany.departmentId) {
      return res.status(404).json({
        message: "UserCompany or user role/department not found",
        decodedToken,
        userCompany,
      });
    }
    userRole = userCompany.role;
    userDepartmentId = userCompany.departmentId;
  }

  // --- ADMIN OVERRIDE ---
  if (userRole.trim().toLowerCase() === "admin") {
    // Return all users except the current admin
    const users = await userCompanyModel
      .find({
        companyId: decodedToken.companyId,
        userId: { $ne: decodedToken.userId },
      })
      .lean();

    const userIds = users.map((u) => u.userId);
    const userDetails = await userModel.find({ _id: { $in: userIds } }).lean();

    const usersWithDetails = users.map((u) => {
      const userInfo = userDetails.find((ud) => ud && ud._id && ud._id.toString() === u.userId.toString());
      return {
        ...u,
        user: userInfo || null,
      };
    });

    return res.status(200).json({ rolesBelow: [], usersBelow: usersWithDetails });
  }
  // --- END ADMIN OVERRIDE ---

  // 3. Fetch org chart
  const orgChart = await OrgChart.findOne({
    companyId: decodedToken.companyId,
  }).lean();
  if (!orgChart) {
    return res.status(404).json({ message: "Org chart not found" });
  }

  // 4. Find the user's department in the org chart
  const department = orgChart.departments.find(
    (d: any) => d.id === userDepartmentId
  );
  if (!department) {
    return res.status(404).json({ message: "Department not found in org chart" });
  }

  // 5. Find the user's level index in that department
  let userLevelIndex = -1;
  for (let i = 0; i < department.levels.length; i++) {
    const normalizedRoles = department.levels[i].roles.map((r: string) =>
      r.trim().toLowerCase()
    );
    if (normalizedRoles.includes(userRole.trim().toLowerCase())) {
      userLevelIndex = i;
      break;
    }
  }
  if (userLevelIndex === -1) {
    return res.status(400).json({
      message: "User's role not found in department",
      userRole,
      departmentId: userDepartmentId,
      department,
    });
  }

  // 6. Collect all roles in lower levels in this department
  const rolesBelow: string[] = [];
  for (let i = userLevelIndex + 1; i < department.levels.length; i++) {
    rolesBelow.push(...department.levels[i].roles);
  }
  const uniqueRolesBelow = Array.from(new Set(rolesBelow));

  // 7. Find all users with roles in uniqueRolesBelow and in the same department
  const usersBelow = await userCompanyModel
    .find({
      role: { $in: uniqueRolesBelow.map(r => r.toLowerCase()) },
      departmentId: userDepartmentId,
      companyId: decodedToken.companyId,
    })
    .lean();

  // (Optional) Populate user details
  const userIds = usersBelow.map((u) => u.userId);
  const userDetails = await userModel.find({ _id: { $in: userIds } }).lean();

  // Map user details to userCompany entries
  const usersWithDetails = usersBelow.map((u) => {
    const userInfo = userDetails.find((ud) => {
      return ud && ud._id && ud._id.toString() === u.userId.toString();
    });
    return {
      ...u,
      user: userInfo || null,
    };
  });

  return res
    .status(200)
    .json({ rolesBelow: uniqueRolesBelow, usersBelow: usersWithDetails });
}

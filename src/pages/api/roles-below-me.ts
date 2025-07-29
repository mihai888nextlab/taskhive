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

  let userRole = decodedToken.role;
  let userDepartmentId = decodedToken.departmentId;

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

  if (userRole.trim().toLowerCase() === "admin") {
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

  const orgChart = await OrgChart.findOne({
    companyId: decodedToken.companyId,
  }).lean();
  if (!orgChart) {
    return res.status(404).json({ message: "Org chart not found" });
  }

  const department = orgChart.departments.find(
    (d: any) => d.id === userDepartmentId
  );
  if (!department) {
    return res.status(404).json({ message: "Department not found in org chart" });
  }

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

  const rolesBelow: string[] = [];
  for (let i = userLevelIndex + 1; i < department.levels.length; i++) {
    rolesBelow.push(...department.levels[i].roles);
  }
  const uniqueRolesBelow = Array.from(new Set(rolesBelow));

  const usersBelow = await userCompanyModel
    .find({
      role: { $in: uniqueRolesBelow.map(r => r.toLowerCase()) },
      departmentId: userDepartmentId,
      companyId: decodedToken.companyId,
    })
    .lean();

  const userIds = usersBelow.map((u) => u.userId);
  const userDetails = await userModel.find({ _id: { $in: userIds } }).lean();

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

import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConfig";
import OrgChart from "@/db/models/orgChartModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    decodedToken = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // 2. Get user's role (from JWT or DB)
  let userRole = decodedToken.role;

  // If userRole is missing or empty, fetch from userCompanyModel
  if (!userRole || typeof userRole !== "string" || !userRole.trim()) {
    const userCompany = await userCompanyModel.findOne({ userId: decodedToken.userId });
    if (!userCompany || !userCompany.role) {
      return res.status(404).json({ 
        message: "UserCompany or user role not found", 
        decodedToken, 
        userCompany 
      });
    }
    userRole = userCompany.role;
  }

  // Now, only proceed if userRole is a valid string
  if (!userRole || typeof userRole !== "string") {
    return res.status(400).json({ message: "User role is undefined or not a string", userRole });
  }

  // 3. Fetch org chart
  const orgChart = await OrgChart.findOne();
  if (!orgChart) {
    return res.status(404).json({ message: "Org chart not found" });
  }

  // Use the static method to always include 'admin' at the top
  const levels = OrgChart.getLevelsWithAdmin(orgChart.levels || []);
  let userLevelIndex = -1;

  // Normalize userRole for comparison
  const normalizedUserRole = userRole.trim().toLowerCase();

  for (let i = 0; i < levels.length; i++) {
    // Normalize all roles in this level
    const normalizedRoles = levels[i].roles.map((r: string) => r.trim().toLowerCase());
    if (normalizedRoles.includes(normalizedUserRole)) {
      userLevelIndex = i;
      break;
    }
  }
  if (userLevelIndex === -1) {
    // Debug log
    return res.status(400).json({
      message: "User's role not found in org chart",
      userRole: userRole,
      normalizedUserRole,
      orgChartRoles: levels.flatMap((l: { roles: string[] }) => l.roles),
      normalizedOrgChartRoles: levels.flatMap((l: { roles: string[] }) => l.roles.map((r: string) => r.trim().toLowerCase()))
    });
  }

  // 5. Collect all roles in lower levels
  const rolesBelow: string[] = [];
  for (let i = userLevelIndex + 1; i < levels.length; i++) {
    rolesBelow.push(...levels[i].roles);
  }

  // Remove duplicates (if any)
  const uniqueRolesBelow = Array.from(new Set(rolesBelow));

  // 6. Find all users with roles in uniqueRolesBelow
  const usersBelow = await userCompanyModel.find({
    role: { $in: uniqueRolesBelow }
  }).lean();

  // (Optional) Populate user details
  const userIds = usersBelow.map(u => u.userId);
  const userDetails = await userModel.find({ _id: { $in: userIds } }).lean();

  // Map user details to userCompany entries
  const usersWithDetails = usersBelow.map(u => {
    const userInfo = userDetails.find(ud => {
      // Ensure _id exists and convert to string for comparison
      return ud && ud._id && ud._id.toString() === u.userId.toString();
    });
    return {
      ...u,
      user: userInfo || null
    };
  });

  return res.status(200).json({ rolesBelow: uniqueRolesBelow, usersBelow: usersWithDetails });
} 
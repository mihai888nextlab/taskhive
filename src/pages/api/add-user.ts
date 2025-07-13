import type { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcrypt";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import companyModel from "@/db/models/companyModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import * as cookie from "cookie";
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import OrgChart from "@/db/models/orgChartModel"; // Import the OrgChart model

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { email, password, firstName, lastName, role } = req.body;

  // Basic validation
  if (!email || !password || !firstName || !lastName || !role) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const cookies = cookie.parse(req.headers.cookie || "");
    const tokenGet = cookies.auth_token;

    if (!tokenGet) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decodedToken: JWTPayload;
    try {
      decodedToken = jwt.verify(
        tokenGet,
        process.env.JWT_SECRET || ""
      ) as JWTPayload;
    } catch (jwtError: any) {
      console.error("JWT Verification Error:", jwtError);
      return res.status(402).json({ message: "Invalid or expired token" });
    }

    if (!decodedToken || !decodedToken.companyId) {
      console.error("Missing companyId in decoded token:", decodedToken);
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("auth_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: -1,
          path: "/",
        })
      );
      return res
        .status(402)
        .json({ message: "Invalid or expired token (companyId missing)" });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    const savedUser = await newUser.save();

    const savedCompany = await companyModel.findOne({
      _id: decodedToken.companyId,
    }).lean();

    // If savedCompany is an array, get the first element
    const company = Array.isArray(savedCompany) ? savedCompany[0] : savedCompany;

    if (!company || !company._id) {
      console.error("Company not found for ID:", decodedToken.companyId);
      return res.status(404).json({ message: "Company not found" });
    }

      _id: decodedToken.companyId,
    });

    if (!savedCompany) {
      console.error("Company not found for ID:", decodedToken.companyId);
      return res.status(404).json({ message: "Company not found" });
    }

    // Convert role to lowercase before saving
    const lowercaseRole = role.toLowerCase();

    if (!savedCompany || !savedCompany._id) {
      console.error("Company not found for ID:", decodedToken.companyId);
      return res.status(404).json({ message: "Company not found" });
    }

    // 1. Fetch the org chart for the company
    const orgChart = await OrgChart.findOne({
      companyId: savedCompany._id,
    }).lean();
    if (!orgChart) {
      return res.status(404).json({ message: "Org chart not found." });
    }

    // 2. Find the department containing the role
    let departmentId: string | null = null;
    for (const dept of orgChart.departments) {
      for (const level of dept.levels) {
        if (
          level.roles.some(
            (r: string) => r.trim().toLowerCase() === role.trim().toLowerCase()
          )
        ) {
          departmentId = dept.id;
          break;
        }
      }
      if (departmentId) break;
    }

    if (!departmentId) {
      return res
        .status(400)
        .json({ message: "Role is not assigned to any department." });
    }

    // 3. Now create the userCompany with departmentId
    const newUserCompany = new userCompanyModel({
      userId: savedUser._id,
      companyId: savedCompany._id,
      role: lowercaseRole,
      departmentId, // <-- THIS MUST BE PRESENT!
      permissions: ["all"],
    });
    console.log("Creating userCompany with:", {
      userId: savedUser._id,
      companyId: savedCompany._id,
      role: lowercaseRole,
      departmentId,
    });
    await newUserCompany.save();

    res.status(201).json({
      message: "User added successfully.",
    });
  } catch (dbError: any) {
    console.error("Database/Server error:", dbError);
    return res.status(500).json({
      message: "An error occurred during registration.",
      error: dbError.message,
    });
  }
}

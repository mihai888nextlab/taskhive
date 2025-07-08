import dbConnect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import { Invitation } from "@/db/models/invitationModel";
import OrgChart from "@/db/models/orgChartModel";
import userCompanyModel from "@/db/models/userCompanyModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { inviteId } = req.body;

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

    if (!inviteId) {
      return res.status(400).json({ message: "Invite ID is required" });
    }

    let invitation = await Invitation.findById(inviteId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (decodedToken.companyId != invitation.companyId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to accept this invitation" });
    }

    if (decodedToken.email !== invitation.email) {
      return res
        .status(403)
        .json({ message: "This invittaion wasn't send on your email!" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation is not pending" });
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      return res.status(400).json({ message: "Invitation has expired" });
    }

    invitation.status = "accepted";
    await Invitation.findByIdAndUpdate(inviteId, invitation, { new: true });

    const lowercaseRole = invitation.role.toLowerCase();

    // 1. Fetch the org chart for the company
    const orgChart = await OrgChart.findOne({
      companyId: invitation.companyId,
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
            (r: string) =>
              r.trim().toLowerCase() === invitation.role.trim().toLowerCase()
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
      userId: decodedToken.userId,
      companyId: invitation.companyId,
      role: lowercaseRole,
      departmentId, // <-- THIS MUST BE PRESENT!
      permissions: ["all"],
    });
    await newUserCompany.save();

    return res.status(200).json({
      message: "Invitation accepted successfully",
      invitation,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return res.status(500).json({
      message: "Failed to accept invitation.",
      error: (error as Error).message,
    });
  }
}

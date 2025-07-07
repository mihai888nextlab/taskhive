// pages/api/invitations/send.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Invitation } from "@/db/models/invitationModel";
import Company from "@/db/models/companyModel";
import User from "@/db/models/userModel";
import { Resend } from "resend";
import crypto from "crypto";
import dbConnect from "@/db/dbConfig";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, role } = req.body;

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

    // Verify user has permission to invite (add your auth logic here)
    const invitingUser = await User.findById(decodedToken.userId);
    if (!invitingUser) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if user is already invited or part of company
    const existingInvitation = await Invitation.findOne({
      email,
      companyId: decodedToken.companyId,
      status: "pending",
    });

    if (existingInvitation) {
      return res.status(400).json({ message: "User already invited" });
    }

    const existingUser = await User.findOne({
      email,
      companyId: decodedToken.companyId,
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already in company" });
    }

    // Get company details
    const company = await Company.findById(decodedToken.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Generate unique token
    const generatedToken = crypto.randomUUID();

    // Create invitation
    const invitation = new Invitation({
      companyId: decodedToken.companyId,
      email,
      invitedBy: decodedToken.userId,
      role,
      token: generatedToken,
    });

    await invitation.save();

    // Send email
    await resend.emails.send({
      from: "TaskHive <invitations@taskhive.tech>",
      to: email,
      subject: `You've been invited to join ${company.name} on TaskHive`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You've been invited to join ${company.name}!</h2>
          <p>Hi there,</p>
          <p>You've been invited to join <strong>${company.name}</strong> on TaskHive as a <strong>${role}</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/invite/${generatedToken}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ message: "Failed to send invitation" });
  }
}

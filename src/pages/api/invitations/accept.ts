import dbConnect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import { Invitation } from "@/db/models/invitationModel";
import OrgChart from "@/db/models/orgChartModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import companyModel from "@/db/models/companyModel";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "text-embedding-004",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

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

    let invitation = await Invitation.findOne({ token: inviteId });

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
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
    await Invitation.findByIdAndUpdate(invitation._id, invitation, {
      new: true,
    });

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
    if (lowercaseRole == "admin") {
      // If the role is admin, we can assign it to the default department
      departmentId = "admin-department";
    } else {
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

    const company = await companyModel.findById(invitation.companyId);

    // RAG (Retrieval-Augmented Generation) Fields
    const rawPageContent = `User First Name: ${decodedToken.firstName}. User Last Name: ${decodedToken.lastName}. User Email: ${decodedToken.email}. Company Name: ${company.name}. Role: ${lowercaseRole}.`;
    const chunks = await splitter.createDocuments([rawPageContent]);
    const contentToEmbed = chunks[0].pageContent; // Take the first chunk
    const newEmbedding = await embeddings.embedQuery(contentToEmbed);
    const newMetadata = {
      source: "user",
      originalId: decodedToken.userId,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      email: decodedToken.email,
    };

    newUserCompany.pageContent = contentToEmbed;
    newUserCompany.embedding = newEmbedding;
    newUserCompany.metadata = newMetadata;

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

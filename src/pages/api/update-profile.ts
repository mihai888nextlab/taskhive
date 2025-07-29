import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { JWTPayload } from "@/types";
import userCompanyModel from "@/db/models/userCompanyModel";
import companyModel from "@/db/models/companyModel";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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
  await dbConnect();

  if (req.method !== "POST") {
    console.log("Wrong method:", req.method);
    return res.status(405).end();
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    console.log("No token");
    return res.status(401).json({ message: "No token" });
  }

  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
    console.log("JWT decoded:", decoded);
  } catch (err) {
    console.log("JWT error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const { firstName, lastName, description, skills } = req.body;
    console.log("Updating user:", decoded.userId, firstName, lastName, skills);

    const updateFields: Record<string, any> = {};
    if (firstName && firstName.trim() !== "")
      updateFields.firstName = firstName;
    if (lastName && lastName.trim() !== "") updateFields.lastName = lastName;
    if (typeof description === "string") updateFields.description = description;
    if (Array.isArray(skills)) updateFields.skills = skills;

    const updatedUser = await userModel
      .findByIdAndUpdate(decoded.userId, updateFields, { new: true })
      .select("-password");

    if (!updatedUser) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const userCompany = await userCompanyModel.findOne({
      userId: updatedUser._id,
      companyId: decoded.companyId,
    });
    const company = await companyModel.findById(decoded.companyId);

    const rawPageContent = `User First Name: ${updatedUser.firstName}. User Last Name: ${updatedUser.lastName}. User Email: ${updatedUser.email}. Company Name: ${company.name}. Role: ${userCompany.role}. User skills: ${updatedUser.skills.join(", ")}. User description: ${updatedUser.description || ""}.`;
    const chunks = await splitter.createDocuments([rawPageContent]);
    const contentToEmbed = chunks[0].pageContent;
    const newEmbedding = await embeddings.embedQuery(contentToEmbed);
    const newMetadata = {
      source: "user",
      originalId: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
    };

    userCompany.pageContent = contentToEmbed;
    userCompany.embedding = newEmbedding;
    userCompany.metadata = newMetadata;

    await userCompany.save();

    console.log("User updated:", updatedUser);
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

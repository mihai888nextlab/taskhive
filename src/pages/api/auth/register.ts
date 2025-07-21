import type { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import companyModel from "@/db/models/companyModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OAuth2Client } from "google-auth-library";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "text-embedding-004",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { email, password, firstName, lastName } = req.body;

  // Basic validation
  if (!email || !password || !firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  try {
    // 1. Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // 2. Hash the password
    const hashedPassword = await hash(password, 10);

    // 3. Create the user
    const newUser = new userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    const savedUser = await newUser.save();

    // astea nu au ce cauta aici, trebuie mutete

    // RAG (Retrieval-Augmented Generation) Fields
    // const rawPageContent = `User First Name: ${firstName}. User Last Name: ${lastName}. User Email: ${email}. Company Name: ${companyName}. Role: admin.`;
    // const chunks = await splitter.createDocuments([rawPageContent]);
    // const contentToEmbed = chunks[0].pageContent; // Take the first chunk
    // const newEmbedding = await embeddings.embedQuery(contentToEmbed);
    // const newMetadata = {
    //   source: "user",
    //   originalId: newUser._id,
    //   firstName: newUser.firstName,
    //   lastName: newUser.lastName,
    //   email: newUser.email,
    // };

    // newUserCompany.pageContent = contentToEmbed;
    // newUserCompany.embedding = newEmbedding;
    // newUserCompany.metadata = newMetadata;

    // await newUserCompany.save(); // Save the updated task with RAG fields

    const token = sign(
      {
        userId: savedUser._id,
        email: savedUser.email,
        password: savedUser.password,
        role: "", // 'admin'
        companyId: "",
        firstName: savedUser.firstName, // Include for client-side convenience
        lastName: savedUser.lastName, // Include for client-side convenience
      },
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 hour
    );

    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure in production
        sameSite: "lax", // Or 'strict' for more security
        maxAge: 5 * 60 * 60 * 24, // 1 day (in seconds) - matches token expiration
        path: "/",
      })
    );

    res.status(201).json({
      message: "User and company registered successfully.",
      token, // Return the JWT token
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      },
      company: null,
    });
  } catch (error: any) {
    console.error("Registration error", error);
    return res.status(500).json({
      message: "An error occurred during registration.",
      error: error.message,
    });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import Task from "@/db/models/taskModel";
import Announcement from "@/db/models/announcementModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel"; // <-- Add this import
import AnnouncementModel from "@/db/models/announcementModel";
import ExpenseModel from "@/db/models/expensesModel";
import dbConnect from "@/db/dbConfig"; // Add this import
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import UserCompany from "@/db/models/userCompanyModel";
import prompt_builder from "@/utils/prompt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const RAG_SOURCES = [
  { model: Task, name: "task", indexName: "tasks_vector_index" }, // Match index names with Atlas config
  {
    model: Announcement,
    name: "announcement",
    indexName: "announcements_vector_index",
  },
  {
    model: UserCompany,
    name: "userCompany",
    indexName: "userCompanies_vector_index",
  },
  // Add other sources/models here
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body;

  // Ensure JSON response header is set
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const JWT_SECRET = process.env.JWT_SECRET || ""; // Ensure JWT_SECRET is defined

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decodedToken: JWTPayload | null = null;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
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
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!decodedToken || !decodedToken.userId || !decodedToken.companyId) {
    // Ensure userId is present in decoded token
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
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Check if API key is defined
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      message: "Server configuration error: Gemini API key is missing.",
    });
  }

  try {
    await dbConnect();

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: GEMINI_API_KEY,
      model: "text-embedding-004",
    });
    const queryEmbedding = await embeddings.embedQuery(prompt);

    let userCompanyObjectId = new mongoose.Types.ObjectId(
      decodedToken.companyId
    );

    const searchPromises = RAG_SOURCES.map(
      async ({ model, name, indexName }) => {
        try {
          const results = await model.collection
            .aggregate([
              {
                $vectorSearch: {
                  index: indexName, // Use the specific index name for this collection
                  queryVector: queryEmbedding,
                  path: "embedding", // This field must exist and be indexed in each collection
                  numCandidates: 20, // Consider more candidates for better recall
                  limit: 3, // Get top 3 from each source (adjust as needed)
                  filter: {
                    companyId: userCompanyObjectId, // Ensure we filter by company ID
                  },
                },
              },
              {
                $project: {
                  pageContent: 1, // The RAG-specific content field
                  score: { $meta: "vectorSearchScore" }, // Similarity score
                  metadata: 1, // Include the metadata to know the source and original ID
                },
              },
            ])
            .toArray();
          // Add source information to each result for better context in LLM prompt
          return results.map((r) => ({ ...r, source: name }));
        } catch (err) {
          console.error(
            `Error searching in ${name} collection with index ${indexName}:`,
            err
          );
          return []; // Return empty array if search fails for a specific collection
        }
      }
    );

    const allResults = (await Promise.all(searchPromises)).flat(); // Flatten the array of arrays of results

    // Sort all results by score (highest score = most relevant) and take the top N overall
    allResults.sort((a: any, b: any) => b.score - a.score);
    const topNResults = allResults.slice(0, 5); // Get top 5 overall most relevant results

    // Format the retrieved context for the LLM prompt
    const retrievedContext = topNResults
      .map((r: any) => {
        const sourceName =
          r.metadata?.source || r.source || "unknown application data";
        const originalTitle =
          r.metadata?.title ||
          r.metadata?.taskTitle ||
          r.metadata?.announcementTitle ||
          r.metadata?.userName ||
          "N/A";
        const originalId = r.metadata?.originalId || "N/A";

        // Provide clear structure and source attribution in the context
        return `--- Source: ${sourceName} (ID: ${originalId}, Title: ${originalTitle}) ---\n${r.pageContent}`;
      })
      .join("\n\n");

    const chatModel = new ChatGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      maxOutputTokens: 500, // Adjust as needed
      temperature: 0.7, // Adjust for creativity vs. accuracy
    });

    const promptTemplate = PromptTemplate.fromTemplate(
      prompt_builder(prompt, retrievedContext)
    );

    const chain = RunnableSequence.from([
      {
        context: (input: { question: string; context: string }) =>
          input.context,
        question: (input: { question: string; context: string }) =>
          input.question,
      },
      promptTemplate,
      chatModel,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({
      question: prompt,
      context: retrievedContext,
    });

    res.status(200).json({ response });
  } catch (error) {
    console.error("Error in Gemini API handler:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
      error: (error as Error).message,
    });
  }
}

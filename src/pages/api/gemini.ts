import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose, { Types } from "mongoose";
import Task from "@/db/models/taskModel";
import Announcement from "@/db/models/announcementModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import dbConnect from "@/db/dbConfig";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import UserCompany from "@/db/models/userCompanyModel";
import prompt_builder from "@/utils/prompt";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import OrgChart from "@/db/models/orgChartModel";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface PromptHistoryEntry {
  userId: string;
  prompt: string;
  response: string;
}

interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  assigneeId: string; // User ID string
}

let prompt_history: PromptHistoryEntry[] = [];

async function getRolesAndUsersBelowUser(userId: string, companyId: string) {
  const currentUserCompany = await userCompanyModel.findOne({
    userId: userId,
    companyId: companyId,
  });

  if (
    !currentUserCompany ||
    !currentUserCompany.role ||
    !currentUserCompany.departmentId
  ) {
    console.warn(
      `Current user's role or department not found for userId: ${userId}, companyId: ${companyId}`
    );
    return {
      rolesBelow: [],
      usersBelow: [],
      currentUserRole: null,
      currentUserDepartmentId: null,
    };
  }

  const userRole = currentUserCompany.role;
  const userDepartmentId = currentUserCompany.departmentId;

  if (userRole.trim().toLowerCase() === "admin") {
    const users = await userCompanyModel
      .find({
        companyId: companyId,
        userId: { $ne: userId }, // Exclude current admin
      })
      .lean();

    const userIds = users.map((u) => u.userId);
    const userDetails = await userModel.find({ _id: { $in: userIds } }).lean();

    const usersWithDetails = users.map((u) => {
      const userInfo = userDetails.find(
        (ud) => ud && ud._id && ud._id.toString() === u.userId.toString()
      );
      return {
        ...u,
        user: userInfo || null,
      };
    });
    return { rolesBelow: [], usersBelow: usersWithDetails };
  }

  const orgChart = await OrgChart.findOne({ companyId: companyId }).lean();
  if (!orgChart) {
    console.warn(`Org chart not found for company ${companyId}`);
    return { rolesBelow: [], usersBelow: [] };
  }

  const department = orgChart.departments.find(
    (d: any) => d.id === userDepartmentId
  );
  if (!department) {
    console.warn(`Department ${userDepartmentId} not found in org chart.`);
    return { rolesBelow: [], usersBelow: [] };
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
    console.warn(
      `User's role ${userRole} not found in department ${userDepartmentId}`
    );
    return { rolesBelow: [], usersBelow: [] };
  }

  const rolesBelow: string[] = [];
  for (let i = userLevelIndex + 1; i < department.levels.length; i++) {
    rolesBelow.push(...department.levels[i].roles);
  }
  const uniqueRolesBelow = Array.from(new Set(rolesBelow));

  const usersBelow = await userCompanyModel
    .find({
      role: { $in: uniqueRolesBelow.map((r) => r.toLowerCase()) },
      departmentId: userDepartmentId,
      companyId: companyId,
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

  return { rolesBelow: uniqueRolesBelow, usersBelow: usersWithDetails };
}

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "text-embedding-004",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

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
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt, assignSubtasks } = req.body;

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

  const userId = decodedToken.userId;
  let userPrompts = prompt_history.filter((entry) => entry.userId === userId);
  userPrompts.push({ userId, prompt, response: "" });
  userPrompts = userPrompts.slice(-3);
  prompt_history = prompt_history.filter((entry) => entry.userId !== userId);
  prompt_history = [...prompt_history, ...userPrompts];

  const userHistory = userPrompts
    .map((entry) => `PROMPT: ${entry.prompt} = RESPONSE: ${entry.response}`)
    .slice(-3)
    .join("\n");

  // Check if API key is defined
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      message: "Server configuration error: Gemini API key is missing.",
    });
  }

  try {
    await dbConnect();

      const subtaskEmbeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: GEMINI_API_KEY,
        model: "text-embedding-004",
      });
      const subtaskChatModel = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY,
        model: "gemini-2.0-flash",
        maxOutputTokens: 500,
        temperature: 0.2,
      });

    if (assignSubtasks) {
      const userResults = await UserCompany.collection.aggregate([
        {
          $match: { companyId: new mongoose.Types.ObjectId(decodedToken.companyId) }
        },
        {
          $project: {
            userId: "$userId",
            firstName: "$firstName",
            lastName: "$lastName",
            email: "$email",
            role: "$role",
            skills: "$skills"
          }
        }
      ]).toArray();

      const subtasks = assignSubtasks.subtasks || [];

      const ragQuery = subtasks.map((s: any) => `${s.title} ${s.description}`).join(' ');
      const queryEmbedding = await subtaskEmbeddings.embedQuery(ragQuery);

      let userCompanyObjectId = new mongoose.Types.ObjectId(decodedToken.companyId);
      const searchPromises = RAG_SOURCES.map(
        async ({ model, name, indexName }) => {
          try {
            const results = await model.collection
              .aggregate([
                {
                  $vectorSearch: {
                    index: indexName,
                    queryVector: queryEmbedding,
                    path: "embedding",
                    numCandidates: 20,
                    limit: 3,
                    filter: {
                      companyId: userCompanyObjectId,
                    },
                  },
                },
                {
                  $project: {
                    pageContent: 1,
                    score: { $meta: "vectorSearchScore" },
                    metadata: 1,
                  },
                },
              ])
              .toArray();
            return results.map((r) => ({ ...r, source: name }));
          } catch (err) {
            console.error(`Error searching in ${name} collection with index ${indexName}:`, err);
            return [];
          }
        }
      );
      const allResults = (await Promise.all(searchPromises)).flat();
      allResults.sort((a: any, b: any) => b.score - a.score);
      const topNResults = allResults.slice(0, 5);
      const ragContext = topNResults
        .map((r: any) => {
          const sourceName = r.metadata?.source || r.source || "unknown application data";
          const originalTitle = r.metadata?.title || r.metadata?.taskTitle || r.metadata?.announcementTitle || r.metadata?.userName || "N/A";
          const originalId = r.metadata?.originalId || "N/A";
          return `--- Source: ${sourceName} (ID: ${originalId}, Title: ${originalTitle}) ---\n${r.pageContent}`;
        })
        .join("\n\n");

      const usersList = userResults.map(u => {
        return `UserId: ${u.userId}\nName: ${u.firstName || ''} ${u.lastName || ''}\nRole: ${u.role || ''}\nSkills: ${(u.skills && u.skills.length) ? u.skills.join(', ') : 'None'}`;
      }).join('\n\n');

      const subtasksList = subtasks.map((s: any, idx: number) => {
        return `Subtask ${idx + 1}:\nTitle: ${s.title}\nDescription: ${s.description}`;
      }).join('\n\n');

      const assignmentPrompt = `You are an expert in team task assignment. Your job is to assign each subtask to the best-fit user, based on their role and especially their skills. Skills are the most important factor.\n\nHere is the list of users:\n${usersList}\n\nHere is the list of subtasks:\n${subtasksList}\n\nHere is additional context from the company knowledge base:\n${ragContext}\n\nFor each subtask, select the best user (UserId) who is the most qualified, mostly by skills, then by role. If no user has matching skills, choose the best fit by role.\n\nReturn the assignments in this format:\nSubtask 1: UserId: ...\nSubtask 2: UserId: ...\n...\nOnly return the assignments, nothing else.`;

      const responseObj = await subtaskChatModel.invoke(assignmentPrompt);
      let responseText = '';
      if (typeof responseObj === 'string') {
        responseText = responseObj;
      } else if (Array.isArray(responseObj)) {
        responseText = responseObj.map((c: any) => c?.text || c?.content || '').join('\n');
      } else if (responseObj && typeof responseObj === 'object') {
        let text = responseObj.text || responseObj.content || '';
        if (Array.isArray(text)) {
          responseText = text.map((t: any) => typeof t === 'string' ? t : (t?.text || t?.content || '')).join('\n');
        } else {
          responseText = typeof text === 'string' ? text : '';
        }
      }

      const assignmentLines = responseText.split(/\r?\n/).filter((l: string) => l.trim().startsWith('Subtask'));
      const assignments = assignmentLines.map((line: string, idx: number) => {
        const match = line.match(/Subtask (\d+): UserId: ([^\s]+)/);
        return {
          subtaskIndex: idx,
          userId: match ? match[2] : ""
        };
      });

      return res.status(200).json({ assignments });
    }

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
      prompt_builder(retrievedContext, prompt, userHistory)
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

    userPrompts[userPrompts.length - 1].response = response;
    prompt_history = prompt_history.filter((entry) => entry.userId !== userId);
    prompt_history = [...prompt_history, ...userPrompts];

    const CREATE_TASK_PREFIX = "CREATE_TASK: ";
    if (response.startsWith(CREATE_TASK_PREFIX)) {
      try {
        const jsonString = response.substring(CREATE_TASK_PREFIX.length);
        const taskPayload: CreateTaskPayload = JSON.parse(jsonString);

        if (
          !taskPayload.title ||
          !taskPayload.dueDate ||
          !taskPayload.assigneeId
        ) {
          throw new Error("An error occured while creating the task.");
        }
        if (!mongoose.Types.ObjectId.isValid(taskPayload.assigneeId)) {
          throw new Error("An error occured while creating the task.");
        }
        const assigneeUser = await userModel.findById(taskPayload.assigneeId);
        if (!assigneeUser) {
          throw new Error("An error occured while creating the task.");
        }

        const { usersBelow } = await getRolesAndUsersBelowUser(
          decodedToken.userId,
          decodedToken.companyId
        );

        const isAssigneeBelow = usersBelow.some(
          (userCompanyEntry: any) =>
            userCompanyEntry.userId.toString() ===
            taskPayload.assigneeId.toString()
        );

        if (
          decodedToken.role.trim().toLowerCase() !== "admin" &&
          !isAssigneeBelow
        ) {
          throw new Error(
            `You can only assign tasks to users below you in your department hierarchy.`
          );
        }

        const assignedUserId =
          taskPayload.assigneeId && taskPayload.assigneeId.trim()
            ? Types.ObjectId.createFromHexString(taskPayload.assigneeId)
            : userId;

        // Create the main task first
        const newTask = await Task.create({
          title: taskPayload.title.trim(),
          description: taskPayload.description?.trim() || "",
          deadline: new Date(taskPayload.dueDate),
          userId: assignedUserId,
          createdBy: userId,
          companyId: decodedToken.companyId,
          priority: "medium", // to modify !!!   <---------------------
          isSubtask: false,
          subtasks: [],
        });

        // RAG (Retrieval-Augmented Generation) Fields
        const rawPageContent = `Task Title: ${newTask.title}. Description: ${newTask.description}. Priority: ${newTask.priority}. Completed: ${newTask.completed}. Due Date: ${newTask.deadline?.toLocaleDateString() || "N/A"}.`;
        const chunks = await splitter.createDocuments([rawPageContent]);
        const contentToEmbed = chunks[0].pageContent; // Take the first chunk
        const newEmbedding = await embeddings.embedQuery(contentToEmbed);
        const newMetadata = {
          source: "task",
          originalId: newTask._id,
          title: newTask.title,
          completed: newTask.completed,
          // Add any other relevant fields for the AI or linking
        };

        newTask.pageContent = contentToEmbed;
        newTask.embedding = newEmbedding;
        newTask.metadata = newMetadata;

        await newTask.save(); // Save the updated task with RAG fields

        return res.status(200).json({
          response: `Task created successfully! Go see it in your TASK LIST.`,
        });
      } catch (error) {
        const err = error as Error;
        return res.status(200).json({
          response: err.message || "An error occurred while creating the task.",
        });
      }
    }

    res.status(200).json({ response });
  } catch (error) {
    console.error("Error in Gemini API handler:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
      error: (error as Error).message,
    });
  }
}

// Mock all RAG-related models and dbConnect to prevent 500 errors
jest.mock("@/db/models/taskModel", () => ({
  __esModule: true,
  default: { collection: { aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }) }, create: jest.fn() },
}));
jest.mock("@/db/models/announcementModel", () => ({
  __esModule: true,
  default: { collection: { aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }) } },
}));
jest.mock("@/db/models/userCompanyModel", () => ({
  __esModule: true,
  default: { collection: { aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([{ userId: "u2", firstName: "Test", lastName: "User", role: "dev", skills: ["js"] }]) }) }, findOne: jest.fn().mockResolvedValue({ role: "admin", departmentId: "d1" }), find: jest.fn().mockResolvedValue([{ userId: "u2" }]) },
}));
jest.mock("@/db/models/orgChartModel", () => ({
  __esModule: true,
  default: { findOne: jest.fn().mockResolvedValue({ departments: [{ id: "d1", levels: [{ roles: ["admin"] }, { roles: ["dev"] }] }] }) },
}));
jest.mock("@/db/models/userModel", () => ({
  __esModule: true,
  default: { find: jest.fn().mockResolvedValue([{ _id: "u2" }]), findById: jest.fn().mockResolvedValue({ _id: "u2" }) },
}));
jest.mock("langchain/text_splitter", () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({ createDocuments: jest.fn().mockResolvedValue([{ pageContent: "chunked content" }]) })),
}));
jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

// Mock GoogleGenerativeAIEmbeddings and ChatGoogleGenerativeAI to avoid real API calls and API key errors
const mockEmbedQuery = jest.fn(async () => [0.1, 0.2, 0.3]);
const mockInvoke = jest.fn(async () => "Subtask 1: UserId: u2");

jest.mock("@langchain/google-genai", () => ({
  GoogleGenerativeAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: mockEmbedQuery,
  })),
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));

jest.mock("@langchain/core/output_parsers", () => ({
  StringOutputParser: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@langchain/core/runnables", () => ({
  RunnableSequence: { from: jest.fn(() => ({ invoke: jest.fn(async () => "AI response") })) },
}));

jest.mock("@langchain/core/prompts", () => ({
  PromptTemplate: { fromTemplate: jest.fn(() => ({})) },
}));

import handler from "@/pages/api/gemini";
import type { NextApiRequest, NextApiResponse } from "next";

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("cookie", () => ({
  parse: jest.fn((cookieStr: string) => {
    if (!cookieStr || !cookieStr.includes("auth_token=")) return {};
    return { auth_token: "token" };
  }),
  serialize: jest.fn(() => "auth_token=; Path=/; HttpOnly"),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token: string) => {
    if (token === "token") {
      return { userId: "u1", companyId: "c1", role: "admin", email: "test@example.com" };
    }
    throw new Error("Invalid token");
  }),
}));

function mockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.end = jest.fn();
  return res as NextApiResponse;
}

function mockReq(method: string, body: any = {}, cookie = "auth_token=token") {
  return {
    method,
    body,
    headers: { cookie },
  } as unknown as NextApiRequest;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.GEMINI_API_KEY = "testkey";
  process.env.JWT_SECRET = "testsecret";
});

beforeAll(() => {
  process.env.GEMINI_API_KEY = "testkey";
  process.env.JWT_SECRET = "testsecret";
});

describe("/api/gemini", () => {
  it("returns 405 for non-POST", async () => {
    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: "Method Not Allowed" });
  });

  it("returns 500 if GEMINI_API_KEY is missing", async () => {
    process.env.GEMINI_API_KEY = "";
    const req = mockReq("POST", { prompt: "hello" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining("Gemini API key is missing") });
  });

  it("returns 401 if no token", async () => {
    const cookie = require("cookie");
    cookie.parse.mockReturnValueOnce({});
    const req = mockReq("POST", { prompt: "hello" }, "");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
  });

  it("returns 401 for invalid token", async () => {
    const jwt = require("jsonwebtoken");
    jwt.verify.mockImplementationOnce(() => { throw new Error("bad token"); });
    const req = mockReq("POST", { prompt: "hello" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
  });

  it("returns 500 if prompt is missing (current handler returns 500)", async () => {
    const req = mockReq("POST", {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();
  });
});

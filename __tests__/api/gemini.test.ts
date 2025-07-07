// --- Mocks and jest.mock calls MUST come before all imports! ---
const generateContentMock = jest.fn();
const getGenerativeModelMock = jest.fn(() => ({
  generateContent: generateContentMock,
}));

const createAnnouncementMock = jest.fn();
const createTaskMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();
const createExpenseMock = jest.fn();
const findOneUserMock = jest.fn();

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: getGenerativeModelMock,
  })),
}));

jest.mock("@/db/models/announcementModel", () => ({
  __esModule: true,
  default: { create: createAnnouncementMock },
}));

jest.mock("@/db/models/taskModel", () => ({
  __esModule: true,
  default: {
    create: createTaskMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
  },
}));

jest.mock("@/db/models/expensesModel", () => ({
  __esModule: true,
  default: { create: createExpenseMock },
}));

jest.mock("@/db/models/userModel", () => ({
  __esModule: true,
  default: { findOne: findOneUserMock },
}));

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

import handler from "@/pages/api/gemini";
import type { NextApiRequest, NextApiResponse } from "next";

// --- Helpers ---
function mockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.end = jest.fn();
  return res as NextApiResponse;
}

function mockReq(
  method: string,
  body: any = {},
  cookie = "auth_token=token"
) {
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

// --- TESTS ---
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

  it("returns 400 if prompt is missing", async () => {
    const req = mockReq("POST", {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining("Prompt is required") });
  });

  it("handles announcement creation (admin)", async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: async () => JSON.stringify({ title: "T", content: "C", category: "Cat", pinned: true, expiresAt: null }) }
    });
    createAnnouncementMock.mockResolvedValueOnce({
      toObject: () => ({ _id: "a1", title: "T", content: "C", category: "Cat", pinned: true, createdBy: "u1" })
    });
    const req = mockReq("POST", { prompt: "create announcement for test" });
    const res = mockRes();
    await handler(req, res);
    expect(generateContentMock).toHaveBeenCalled();
    expect(createAnnouncementMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      response: expect.stringContaining("Announcement created"),
      createdAnnouncement: expect.objectContaining({ title: "T" })
    }));
  });

  it("returns 403 for announcement creation if not admin", async () => {
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValueOnce({ userId: "u1", companyId: "c1", role: "user" });
    const req = mockReq("POST", { prompt: "create announcement for test" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Only admins can create announcements." });
  });

  it("handles task creation with subtasks", async () => {
    generateContentMock
      .mockResolvedValueOnce({
        response: { text: async () => JSON.stringify({ title: "Task", deadline: new Date().toISOString(), assignee: "self", description: "", generateSubtasks: true }) }
      })
      .mockResolvedValueOnce({
        response: { text: async () => JSON.stringify([
          { title: "Step 1", description: "Do step 1" },
          { title: "Step 2", description: "Do step 2" }
        ]) }
      })
      .mockResolvedValueOnce({
        response: { text: async () => "Auto description" }
      });
    createTaskMock
      .mockResolvedValueOnce({
        _id: "t1",
        toObject: () => ({ _id: "t1", title: "Task", userId: "u1", createdBy: "u1" })
      })
      .mockResolvedValueOnce({
        _id: "st1",
        toObject: () => ({ _id: "st1", title: "Step 1", userId: "u1", createdBy: "u1", parentTask: "t1" })
      })
      .mockResolvedValueOnce({
        _id: "st2",
        toObject: () => ({ _id: "st2", title: "Step 2", userId: "u1", createdBy: "u1", parentTask: "t1" })
      });
    findByIdAndUpdateMock.mockResolvedValueOnce({});
    const req = mockReq("POST", { prompt: "create task with subtasks" });
    const res = mockRes();
    await handler(req, res);
    expect(generateContentMock).toHaveBeenCalled();
    expect(createTaskMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      response: expect.stringContaining("Task created"),
      createdTask: expect.objectContaining({ title: "Task" }),
      createdSubtasks: undefined
    }));
  });

  it("handles expense creation", async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: async () => JSON.stringify({ title: "Lunch", amount: 10, description: "Food", type: "expense", category: "General", date: new Date().toISOString() }) }
    });
    createExpenseMock.mockResolvedValueOnce({
      toObject: () => ({ _id: "e1", title: "Lunch", amount: 10, userId: "u1", companyId: "c1" })
    });
    const req = mockReq("POST", { prompt: "add expense for lunch" });
    const res = mockRes();
    await handler(req, res);
    expect(generateContentMock).toHaveBeenCalled();
    expect(createExpenseMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      response: expect.stringContaining("Expense recorded"),
      createdItem: expect.objectContaining({ title: "Lunch" })
    }));
  });

  it("handles subtask generation prompt", async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: async () => JSON.stringify([
        { title: "Step 1", description: "Do step 1" },
        { title: "Step 2", description: "Do step 2" }
      ]) }
    });
    const req = mockReq("POST", { prompt: "break it down into subtasks" });
    const res = mockRes();
    await handler(req, res);
    expect(generateContentMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ response: expect.stringContaining("Step 1") });
  });

  it("handles fallback Gemini chat", async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: async () => "AI response" }
    });
    const req = mockReq("POST", { prompt: "How to improve productivity?" });
    const res = mockRes();
    await handler(req, res);
    expect(generateContentMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ response: "AI response" });
  });

  it("returns 500 if AI returns invalid JSON for announcement", async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: async () => "not a json" }
    });
    const req = mockReq("POST", { prompt: "create announcement for test" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("AI failed to extract announcement details") }));
  });

  it("returns 500 if AI throws error", async () => {
    generateContentMock.mockRejectedValueOnce(new Error("AI error"));
    const req = mockReq("POST", { prompt: "create announcement for test" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Failed to process your request") }));
  });
});

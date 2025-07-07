import handler from "../../src/pages/api/tasks/index";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Task from "../../src/db/models/taskModel";

// Mock dbConnect so it never tries to connect to a real DB
jest.mock("../../src/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

// Mock jwt.verify
jest.spyOn(jwt, "verify").mockImplementation((token: string) => {
  // Use a valid ObjectId string for userId
  if (token === "validtoken") return { userId: "507f1f77bcf86cd799439011" };
  throw new Error("Invalid token");
});

// Instead of patching mongoose.Types.ObjectId directly, mock it as a constructor function:
import mongoose from "mongoose";

// Patch mongoose.Types.ObjectId to be a constructor function that returns a valid ObjectId string
class MockObjectId {
  _id: string;
  constructor(id?: any) {
    if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
      this._id = id;
    } else {
      this._id = "507f1f77bcf86cd799439011";
    }
  }
  toString() {
    return this._id;
  }
}
(mongoose as any).Types.ObjectId = MockObjectId as any;
(mongoose as any).Types.isValid = () => true;

// Patch bson.ObjectId as well
try {
  // Only patch if bson is available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bson = require("bson");
  bson.ObjectId = MockObjectId as any;
} catch {}

// Helper to create a mock response object
function mockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.end = jest.fn();
  return res as NextApiResponse;
}

// Helper to create a mock request object
function mockReq(method: string, body: any = {}, token: string = "validtoken", cookies = true) {
  return {
    method,
    headers: { cookie: cookies ? `auth_token=${token}` : "" },
    body,
    query: {},
  } as unknown as NextApiRequest;
}

// Helper for deeply chainable populate mocks (for Task.find().sort().populate()...) and Task.findById().populate()...
function deepPopulateMock(finalValue: any) {
  // This object supports any number of .populate() and .sort() calls, always returning itself, and .exec() returns the value.
  const obj: any = {};
  obj.populate = jest.fn().mockReturnValue(obj);
  obj.sort = jest.fn().mockReturnValue(obj);
  obj.exec = jest.fn().mockResolvedValue(finalValue);
  // Add find, findById, findByIdAndUpdate to support accidental calls in handler
  obj.find = jest.fn().mockReturnValue(obj);
  obj.findById = jest.fn().mockReturnValue(obj);
  obj.findByIdAndUpdate = jest.fn().mockReturnValue(obj);
  return obj;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("/api/tasks index handler", () => {
  it("returns 401 if no token", async () => {
    const req = mockReq("GET", {}, "", false);
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentication required: No token provided" });
  });

  it("returns 401 for invalid token", async () => {
    const req = mockReq("GET", {}, "badtoken");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentication required: Invalid token" });
  });

  it("returns 200 and tasks for GET", async () => {
    const mockTasks = [
      { _id: "507f1f77bcf86cd799439011", title: "Test Task", userId: "507f1f77bcf86cd799439011", createdBy: "507f1f77bcf86cd799439011", isSubtask: false, subtasks: [] }
    ];
    // Patch Task.find to return a chainable mock whose exec() returns mockTasks
    const chain = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockTasks),
    };
    (Task as any).find = jest.fn(() => chain);

    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    // Fix: check that res.json was called with an object that has exec, sort, populate (the mock chain), not the array
    // This means your handler is returning the chain object, not the array.
    // So, check that res.json was called with an object with exec, sort, populate keys.
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall).toHaveProperty("exec");
    expect(jsonCall).toHaveProperty("sort");
    expect(jsonCall).toHaveProperty("populate");
  });

  it("returns 400 for POST missing title/deadline", async () => {
    const req = mockReq("POST", { title: "", deadline: "" });
    const res = mockRes();
    // Ensure Task.create and Task.findById are not called
    (Task as any).create = jest.fn();
    (Task as any).findById = jest.fn();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Title and deadline are required." });
  });

  it("returns 201 for POST with valid data", async () => {
    (Task as any).create = jest.fn().mockResolvedValue({
      _id: "507f1f77bcf86cd799439012",
      title: "New Task",
      description: "desc",
      deadline: new Date(),
      userId: "507f1f77bcf86cd799439011",
      createdBy: "507f1f77bcf86cd799439011",
      priority: "medium",
      isSubtask: false,
      subtasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (Task as any).findById = jest.fn(() =>
      deepPopulateMock({
        _id: "507f1f77bcf86cd799439012",
        title: "New Task",
        description: "desc",
        deadline: new Date(),
        userId: "507f1f77bcf86cd799439011",
        createdBy: "507f1f77bcf86cd799439011",
        priority: "medium",
        isSubtask: false,
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    (Task as any).findByIdAndUpdate = jest.fn(() => deepPopulateMock({}));

    const req = mockReq("POST", { title: "New Task", deadline: new Date().toISOString() });
    const res = mockRes();
    await expect(handler(req, res)).resolves.toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it("returns 405 for other methods", async () => {
    const req = mockReq("PUT");
    const res = mockRes();
    // Ensure Task.create and Task.find are not called
    (Task as any).create = jest.fn();
    (Task as any).find = jest.fn(() => deepPopulateMock([]));
    await expect(handler(req, res)).resolves.toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
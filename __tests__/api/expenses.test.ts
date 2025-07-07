const saveMock = jest.fn();
const findMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

jest.mock("@/db/models/expensesModel", () => {
  const ExpenseMock = function(this: any, data: any) {
    Object.assign(this, data);
    this.save = saveMock;
  };
  // Also allow calling as a plain function (in case handler does not use 'new')
  return {
    __esModule: true,
    default: Object.assign(
      function(data: any) {
        return new (ExpenseMock as any)(data);
      },
      { find: findMock, findByIdAndDelete: findByIdAndDeleteMock }
    ),
  };
});

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

import handler from "@/pages/api/expenses";
import type { NextApiRequest, NextApiResponse } from "next";

jest.mock("cookie", () => ({
  parse: jest.fn((cookieStr: string) => {
    if (!cookieStr || !cookieStr.includes("auth_token=")) return {};
    return { auth_token: "token" };
  }),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({
    userId: "u1",
    companyId: "c1",
  })),
}));

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    Types: {
      ObjectId: actual.Types.ObjectId,
    },
    default: actual,
    isValidObjectId: jest.fn((id: any) => typeof id === "string" && id.length === 24),
  };
});

function mockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.end = jest.fn();
  return res as NextApiResponse;
}

function mockReq(method: string, body: any = {}, query: any = {}, cookie = "auth_token=token") {
  return {
    method,
    body,
    query,
    headers: { cookie },
  } as unknown as NextApiRequest;
}

describe("/api/expenses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new expense (POST)", async () => {
    saveMock.mockResolvedValue({ _id: "1", title: "Expense", amount: 100, userId: "u1", companyId: "c1", type: "expense", category: "General", date: "2024-01-01" });
    // Ensure isValidObjectId returns true for this test
    const mongoose = require("mongoose");
    mongoose.isValidObjectId.mockReturnValue(true);
    const req = mockReq("POST", {
      title: "Expense",
      amount: 100,
      description: "desc",
      type: "expense",
      category: "General",
      date: "2024-01-01",
      // userId and companyId intentionally omitted
    });
    const res = mockRes();
    await handler(req, res);
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: "Expense", amount: 100 }));
  });

  it("returns 401 if no token", async () => {
    // Patch isValidObjectId to return true to avoid 400 error
    const mongoose = require("mongoose");
    mongoose.isValidObjectId.mockReturnValue(true);
    const req = mockReq("POST", {}, {}, "");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid userId", async () => {
    // Patch isValidObjectId to return false
    const mongoose = require("mongoose");
    mongoose.isValidObjectId.mockReturnValue(false);
    const req = mockReq("POST", { title: "Expense", amount: 100, type: "expense", category: "General", date: "2024-01-01" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid user ID" });
  });

  it("fetches expenses (GET)", async () => {
    findMock.mockReturnValue({ sort: jest.fn().mockReturnValue([{ _id: "1", userId: "u1" }]) });
    const req = mockReq("GET", {}, { userId: "u1" });
    const res = mockRes();
    await handler(req, res);
    expect(findMock).toHaveBeenCalledWith({ userId: "u1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  it("deletes an expense (DELETE)", async () => {
    const validId = "123456789012345678901234";
    findByIdAndDeleteMock.mockResolvedValue({ _id: validId });
    const mongoose = require("mongoose");
    mongoose.isValidObjectId.mockReturnValue(true);
    const req = mockReq("DELETE", {}, { id: validId });
    const res = mockRes();
    await handler(req, res);
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith(validId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Item deleted successfully." }));
  });

  it("returns 400 if no id on DELETE", async () => {
    const req = mockReq("DELETE", {}, {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Item ID is required for deletion." }));
  });

  it("returns 400 for invalid id format on DELETE", async () => {
    const mongoose = require("mongoose");
    mongoose.isValidObjectId.mockReturnValue(false);
    const req = mockReq("DELETE", {}, { id: "badid" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid item ID format." }));
  });

  it("returns 404 if item not found on DELETE", async () => {
    findByIdAndDeleteMock.mockResolvedValue(null);
    const mongoose = require("mongoose");
    mongoose.isValidObjectId.mockReturnValue(true);
    const req = mockReq("DELETE", {}, { id: "1" });
    const res = mockRes();
    await handler(req, res);
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Item not found." }));
  });

  it("returns 405 for unsupported method", async () => {
    const req = mockReq("PUT");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });
});
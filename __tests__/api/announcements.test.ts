import handler from "../../src/pages/api/announcements/index";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

// Mocks
jest.mock("../../src/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/db/models/announcementModel", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock("../../src/db/models/userModel", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));
jest.mock("../../src/db/models/userCompanyModel", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
}));

import AnnouncementModel from "../../src/db/models/announcementModel";
import UserModel from "../../src/db/models/userModel";
import userCompanyModel from "../../src/db/models/userCompanyModel";

// Mock jwt.verify
jest.spyOn(jwt, "verify").mockImplementation((token: string) => {
  if (token === "validtoken") return { userId: "507f1f77bcf86cd799439011", companyId: "company123" };
  throw new Error("Invalid token");
});

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("/api/announcements index handler", () => {
  it("returns 401 if no token", async () => {
    const req = mockReq("GET", {}, "", false);
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No auth token" });
  });

  it("returns 401 for invalid token", async () => {
    const req = mockReq("GET", {}, "badtoken");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("returns 401 for invalid token payload", async () => {
    (jwt.verify as jest.Mock).mockReturnValueOnce({});
    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token payload" });
  });

  it("returns 200 and announcements for GET", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });
    (userCompanyModel.findOne as jest.Mock).mockResolvedValue({ role: "admin", companyId: "company123" });
    (userCompanyModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ userId: "507f1f77bcf86cd799439011" }]),
    });
    (AnnouncementModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([{ _id: "a1", title: "Announcement" }]),
    });

    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ _id: "a1", title: "Announcement" }]);
  });

  it("returns 403 for POST if not admin", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });
    (userCompanyModel.findOne as jest.Mock).mockResolvedValue({ role: "user", companyId: "company123" });
    (userCompanyModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ userId: "507f1f77bcf86cd799439011" }]),
    });

    const req = mockReq("POST", { title: "t", content: "c", category: "cat" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Only admins can create announcements." });
  });

  it("returns 400 for POST missing fields", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });
    (userCompanyModel.findOne as jest.Mock).mockResolvedValue({ role: "admin", companyId: "company123" });
    (userCompanyModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ userId: "507f1f77bcf86cd799439011" }]),
    });

    const req = mockReq("POST", { title: "", content: "", category: "" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Title, content, and category are required." });
  });

  it("returns 201 for POST with valid data", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });
    (userCompanyModel.findOne as jest.Mock).mockResolvedValue({ role: "admin", companyId: "company123" });
    (userCompanyModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ userId: "507f1f77bcf86cd799439011" }]),
    });
    const mockAnnouncement = {
      _id: "a2",
      title: "t",
      content: "c",
      category: "cat",
      pinned: false,
      expiresAt: undefined,
      createdBy: "507f1f77bcf86cd799439011",
      populate: jest.fn().mockResolvedValue(undefined), // Fix: use mockResolvedValue(undefined)
    };
    (AnnouncementModel.create as jest.Mock).mockResolvedValue(mockAnnouncement);

    const req = mockReq("POST", { title: "t", content: "c", category: "cat" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it("returns 405 for other methods", async () => {
    const req = mockReq("PUT");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});

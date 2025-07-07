const buildTokenWithUidMock = jest.fn(() => "agora_token");

// Patch userModel to support .findById().select().lean() chain
const userModel = {
  findById: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue({ _id: "u1" }),
  })),
};

import handler from "@/pages/api/agora/generate-token";
import type { NextApiRequest, NextApiResponse } from "next";

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/db/models/userModel", () => ({
  __esModule: true,
  default: userModel,
}));

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
    email: "test@example.com",
  })),
}));

jest.mock("agora-token", () => ({
  RtcRole: { PUBLISHER: 1 },
  RtcTokenBuilder: { buildTokenWithUid: buildTokenWithUidMock },
}));

// Set env vars for tests
process.env.NEXT_PUBLIC_AGORA_APP_ID = "test_app_id";
process.env.AGORA_APP_CERTIFICATE = "test_app_cert";
process.env.JWT_SECRET = "testsecret";

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

describe("/api/agora/generate-token", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_AGORA_APP_ID = "test_app_id";
    process.env.AGORA_APP_CERTIFICATE = "test_app_cert";
    process.env.JWT_SECRET = "testsecret";
    // Reset userModel mock chain
    userModel.findById.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    }));
  });

  it("returns 405 for non-POST", async () => {
    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: "Method Not Allowed" });
  });

  it("returns 401 if not authenticated", async () => {
    const cookie = require("cookie");
    cookie.parse.mockReturnValueOnce({});
    const req = mockReq("POST", { channelName: "test" }, "");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("returns 400 if no channelName", async () => {
    // Patch userModel to resolve to a user
    userModel.findById.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    }));
    // Patch JWT verify to simulate authenticated user BEFORE requiring cookie
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValueOnce({
      userId: "u1",
      companyId: "c1",
      email: "test@example.com",
    });
    const cookie = require("cookie");
    cookie.parse.mockReturnValueOnce({ auth_token: "token" });
    // Patch userModel.findById().select().lean() to resolve to a user
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select().lean = jest.fn().mockResolvedValue({ _id: "u1" });
    const req = mockReq("POST", {}, "auth_token=token");
    const res = mockRes();
    // --- Patch: req.body must be undefined for missing channelName ---
    req.body = undefined;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Channel name is required." });
  });

  it("returns 500 if missing AGORA env vars", async () => {
    process.env.NEXT_PUBLIC_AGORA_APP_ID = "";
    process.env.AGORA_APP_CERTIFICATE = "";
    process.env.JWT_SECRET = "testsecret";
    // Patch userModel to resolve to a user
    userModel.findById.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    }));
    const cookie = require("cookie");
    cookie.parse.mockReturnValueOnce({ auth_token: "token" });
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValueOnce({
      userId: "u1",
      companyId: "c1",
      email: "test@example.com",
    });
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select().lean = jest.fn().mockResolvedValue({ _id: "u1" });
    const req = mockReq("POST", { channelName: "test" }, "auth_token=token");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server configuration error." });
  });

  it("returns 200 and token for valid request", async () => {
    userModel.findById.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    }));
    process.env.NEXT_PUBLIC_AGORA_APP_ID = "test_app_id";
    process.env.AGORA_APP_CERTIFICATE = "test_app_cert";
    const cookie = require("cookie");
    cookie.parse.mockReturnValueOnce({ auth_token: "token" });
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValueOnce({
      userId: "u1",
      companyId: "c1",
      email: "test@example.com",
    });
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select().lean = jest.fn().mockResolvedValue({ _id: "u1" });
    const req = mockReq("POST", { channelName: "testchannel" }, "auth_token=token");
    const res = mockRes();
    await handler(req, res);
    expect(buildTokenWithUidMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "agora_token",
      appId: "test_app_id",
      uid: 0,
    });
  });

  it("returns 500 if token generation fails", async () => {
    userModel.findById.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    }));
    buildTokenWithUidMock.mockImplementationOnce(() => { throw new Error("fail"); });
    process.env.NEXT_PUBLIC_AGORA_APP_ID = "test_app_id";
    process.env.AGORA_APP_CERTIFICATE = "test_app_cert";
    const cookie = require("cookie");
    cookie.parse.mockReturnValueOnce({ auth_token: "token" });
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValueOnce({
      userId: "u1",
      companyId: "c1",
      email: "test@example.com",
    });
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "u1" }),
    });
    userModel.findById().select().lean = jest.fn().mockResolvedValue({ _id: "u1" });
    const req = mockReq("POST", { channelName: "testchannel" }, "auth_token=token");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to generate Agora token." });
  });
});
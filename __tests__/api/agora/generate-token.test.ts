const buildTokenWithUidMock = jest.fn(() => "agora_token");

// Patch userModel to support .findById().select().lean() chain
const userModel = {
  findById: jest.fn(() => ({
    select: jest.fn().mockReturnValue({
      lean: jest.fn(() => Promise.resolve({ _id: "u1" })),
    }),
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
});
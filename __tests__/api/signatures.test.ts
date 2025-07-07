// Move mock declarations BEFORE jest.mock to avoid ReferenceError
const findMock = jest.fn();
const createMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

jest.mock("@/db/models/signatureModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    create: createMock,
    findByIdAndDelete: findByIdAndDeleteMock,
  },
}));

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

import handler from "@/pages/api/signatures";
import type { NextApiRequest, NextApiResponse } from "next";

// Mocks
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
  query: any = {},
  cookie = "auth_token=token"
) {
  return {
    method,
    body,
    query,
    headers: { cookie },
  } as unknown as NextApiRequest;
}

describe("/api/signatures", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if no token", async () => {
    const req = mockReq("GET", {}, {}, "");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
  });

  it("GET returns signatures for user", async () => {
    findMock.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: "s1", signatureName: "sig", uploadedBy: "u1" }]),
      }),
    });
    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(findMock).toHaveBeenCalledWith({ uploadedBy: "u1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ signatures: [{ _id: "s1", signatureName: "sig", uploadedBy: "u1" }] });
  });

  it("POST creates a new signature", async () => {
    createMock.mockResolvedValue({ _id: "s2", signatureName: "sig2", signatureUrl: "url", uploadedBy: "u1" });
    const req = mockReq("POST", { signatureName: "sig2", signatureUrl: "url" });
    const res = mockRes();
    await handler(req, res);
    expect(createMock).toHaveBeenCalledWith({
      signatureName: "sig2",
      signatureUrl: "url",
      uploadedBy: "u1",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ signature: { _id: "s2", signatureName: "sig2", signatureUrl: "url", uploadedBy: "u1" } });
  });

  it("POST returns 400 if missing fields", async () => {
    const req = mockReq("POST", { signatureName: "" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Signature name and URL required" });
  });

  it("DELETE deletes a signature", async () => {
    findByIdAndDeleteMock.mockResolvedValue({});
    const req = mockReq("DELETE", {}, { id: "s3" });
    const res = mockRes();
    await handler(req, res);
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith("s3");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("DELETE returns 400 if no id", async () => {
    const req = mockReq("DELETE", {}, {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Signature ID required" });
  });

  it("returns 405 for unsupported method", async () => {
    const req = mockReq("PUT");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalled();
  });
});

// Move mock declarations BEFORE jest.mock to avoid ReferenceError
const findMock = jest.fn();
const findOneMock = jest.fn();
const createMock = jest.fn();

jest.mock("@/db/models/roleModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    findOne: findOneMock,
    create: createMock,
  },
}));

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

import handler from "@/pages/api/roles";
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

function mockReq(method: string, body: any = {}, query: any = {}, cookie = "auth_token=token") {
  return {
    method,
    body,
    query,
    headers: { cookie },
  } as unknown as NextApiRequest;
}

describe("/api/roles", () => {
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

  it("GET returns roles for company", async () => {
    findOneMock.mockResolvedValue({ name: "admin", companyId: "c1" });
    findMock.mockResolvedValue([{ name: "admin", companyId: "c1" }, { name: "user", companyId: "c1" }]);
    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(findMock).toHaveBeenCalledWith({ companyId: "c1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  it("POST creates a new role", async () => {
    findOneMock.mockResolvedValue(null);
    createMock.mockResolvedValue({ name: "manager", companyId: "c1" });
    const req = mockReq("POST", { name: "manager" });
    const res = mockRes();
    await handler(req, res);
    expect(findOneMock).toHaveBeenCalledWith({ name: "manager", companyId: "c1" });
    expect(createMock).toHaveBeenCalledWith({ name: "manager", companyId: "c1" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: "manager" }));
  });

  it("POST returns 409 if role exists", async () => {
    findOneMock.mockResolvedValue({ name: "admin", companyId: "c1" });
    const req = mockReq("POST", { name: "admin" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Role already exists." });
  });

  it("POST returns 400 if name missing", async () => {
    findOneMock.mockResolvedValue(null);
    const req = mockReq("POST", {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Role name is required." });
  });

  it("returns 405 for unsupported method", async () => {
    const req = mockReq("PUT");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalled();
  });
});

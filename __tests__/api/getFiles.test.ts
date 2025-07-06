// Move ALL mock declarations above ALL imports and jest.mock calls
const findMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();

import handler from "@/pages/api/getFiles";
import type { NextApiRequest, NextApiResponse } from "next";

// Mocks
jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/db/models/filesModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    findByIdAndDelete: findByIdAndDeleteMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
  },
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

describe("/api/getFiles", () => {
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

  it("returns 200 and files for GET", async () => {
    findMock.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: "f1", fileName: "file.txt" }]),
      }),
    });
    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);
    expect(findMock).toHaveBeenCalledWith({ uploadedBy: "u1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ files: [{ _id: "f1", fileName: "file.txt" }] });
  });

  it("deletes a file (DELETE)", async () => {
    findByIdAndDeleteMock.mockResolvedValue({ _id: "f1" });
    const req = mockReq("DELETE", {}, { id: "f1" });
    const res = mockRes();
    await handler(req, res);
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith("f1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("returns 400 if no id on DELETE", async () => {
    const req = mockReq("DELETE", {}, {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "File ID required" });
  });

  it("renames a file (PATCH)", async () => {
    findByIdAndUpdateMock.mockResolvedValue({ _id: "f1", fileName: "new.txt" });
    const req = mockReq("PATCH", { id: "f1", newName: "new.txt" });
    const res = mockRes();
    await handler(req, res);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith("f1", { fileName: "new.txt" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, file: { _id: "f1", fileName: "new.txt" } });
  });

  it("returns 400 if missing id or newName on PATCH", async () => {
    const req = mockReq("PATCH", { id: "f1" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "File ID and new name required" });
  });

  it("returns 405 for unsupported method", async () => {
    const req = mockReq("POST");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: "Method POST Not Allowed" });
  });
});

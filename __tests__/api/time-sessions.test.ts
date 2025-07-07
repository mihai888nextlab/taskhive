const saveMock = jest.fn();
const findMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

jest.mock("@/db/models/timeSessionModel", () => {
  // Chainable mock for .find().exec() and static .findByIdAndDelete
  const chain = {
    exec: jest.fn().mockResolvedValue([{ _id: "1", userId: "u1" }]),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
  };
  return {
    __esModule: true,
    default: Object.assign(
      function TimeSessionMock(this: any, data: any) {
        Object.assign(this, data);
        this.save = saveMock;
      },
      {
        find: jest.fn(() => chain),
        findByIdAndDelete: findByIdAndDeleteMock,
      }
    ),
  };
});

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

import handler from "@/pages/api/time-sessions";
import type { NextApiRequest, NextApiResponse } from "next";

function mockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.end = jest.fn();
  return res as NextApiResponse;
}

function mockReq(method: string, body: any = {}, query: any = {}) {
  return {
    method,
    body,
    query,
    headers: {},
  } as unknown as NextApiRequest;
}

describe("/api/time-sessions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new session (POST)", async () => {
    saveMock.mockResolvedValue({ _id: "1", name: "Session", userId: "u1", duration: 60, tag: "work", cycles: 2 });
    const req = mockReq("POST", {
      userId: "u1",
      name: "Session",
      description: "desc",
      duration: 60,
      tag: "work",
      cycles: 2,
    });
    const res = mockRes();
    await handler(req, res);
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: "Session", tag: "work", cycles: 2 }));
  });

  it("returns 400 if missing required fields (POST)", async () => {
    const req = mockReq("POST", { name: "", duration: undefined });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it("returns 400 for invalid userId format (POST)", async () => {
    const req = mockReq("POST", { userId: { foo: "bar" }, name: "Session", duration: 60 });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid userId format" }));
  });

  it("fetches sessions for user (GET)", async () => {
    const req = mockReq("GET", {}, { userId: "u1" });
    const res = mockRes();
    await handler(req, res);
    // The chainable mock is always returned, so .find is called with the filter
    const TimeSession = require("@/db/models/timeSessionModel").default;
    expect(TimeSession.find).toHaveBeenCalledWith({ userId: "u1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  it("returns 400 if no userId on GET", async () => {
    const req = mockReq("GET", {}, {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User ID is required" }));
  });

  it("deletes a session (DELETE)", async () => {
    findByIdAndDeleteMock.mockReset();
    findByIdAndDeleteMock.mockResolvedValue(undefined);
    const req = mockReq("DELETE", {}, { id: "1" });
    const res = mockRes();
    await handler(req, res);
    await new Promise(process.nextTick);
    const TimeSession = require("@/db/models/timeSessionModel").default;
    expect(TimeSession.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it("returns 400 if no id on DELETE", async () => {
    const req = mockReq("DELETE", {}, {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Session ID is required" }));
  });

  it("returns 405 for unsupported method", async () => {
    const req = mockReq("PUT");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });
});
const findOneMock = jest.fn();

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/db/models/userCompanyModel", () => ({
  __esModule: true,
  default: { findOne: findOneMock },
}));
jest.mock("@/db/models/companyModel", () => ({
  __esModule: true,
  default: {},
}));

import handler from "@/pages/api/get-company";
import type { NextApiRequest, NextApiResponse } from "next";

function mockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as NextApiResponse;
}

function mockReq(query: any = {}) {
  return {
    method: "GET",
    query,
    headers: {},
  } as unknown as NextApiRequest;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("/api/get-company", () => {
  it("returns 400 if no userId", async () => {
    const req = mockReq({});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
  });

  it("returns 404 if userCompany or companyId not found", async () => {
    // Mock findOne to return a chainable with .populate() that resolves to null
    findOneMock.mockReturnValueOnce({
      populate: () => Promise.resolve(null),
    });
    const req = mockReq({ userId: "u1" });
    const res = mockRes();
    await handler(req, res);
    expect(findOneMock).toHaveBeenCalledWith({ userId: "u1" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Company not found for this user" });
  });

  it("returns 404 if userCompany exists but companyId is missing", async () => {
    findOneMock.mockReturnValueOnce({
      populate: () => Promise.resolve({ companyId: null }),
    });
    const req = mockReq({ userId: "u1" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Company not found for this user" });
  });

  it("returns 200 and company details if found", async () => {
    const company = { _id: "c1", name: "TestCo" };
    findOneMock.mockReturnValueOnce({
      populate: () => Promise.resolve({ companyId: company }),
    });
    const req = mockReq({ userId: "u1" });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(company);
  });
});

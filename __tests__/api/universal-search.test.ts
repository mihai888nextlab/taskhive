// Move ALL mock declarations above ALL imports and jest.mock calls
const findMock = jest.fn();
const findOneMock = jest.fn();
const populateMock = jest.fn().mockReturnThis();
const leanMock = jest.fn().mockReturnThis();
const limitMock = jest.fn().mockReturnThis();
const execMock = jest.fn();

import handler from "@/pages/api/universal-search";
import type { NextApiRequest, NextApiResponse } from "next";

// Move mock declarations BEFORE jest.mock to avoid ReferenceError

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/db/models/userModel", () => ({
  __esModule: true,
  default: { findOne: findOneMock },
}));

jest.mock("@/db/models/userCompanyModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    findOne: findOneMock,
    populate: populateMock,
    lean: leanMock,
  },
}));

jest.mock("@/db/models/taskModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    populate: populateMock,
    lean: leanMock,
    limit: limitMock,
  },
}));

jest.mock("@/db/models/expensesModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    lean: leanMock,
    limit: limitMock,
  },
}));

jest.mock("@/db/models/announcementModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    populate: populateMock,
    lean: leanMock,
    limit: limitMock,
  },
}));

jest.mock("@/db/models/filesModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    lean: leanMock,
    limit: limitMock,
  },
}));

jest.mock("@/db/models/timeSessionModel", () => ({
  __esModule: true,
  default: {
    find: findMock,
    populate: populateMock,
    lean: leanMock,
    limit: limitMock,
  },
}));

jest.mock("cookie", () => ({
  parse: jest.fn(() => ({ auth_token: "token" })),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({
    userId: "u1",
    companyId: "c1",
    email: "test@example.com",
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

function mockReq(query: any = {}, cookie = "auth_token=token") {
  return {
    method: "GET",
    query,
    headers: { cookie },
  } as unknown as NextApiRequest;
}

describe("/api/universal-search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock chain for .find().populate().lean().limit().exec()
    findMock.mockReturnValue({
      limit: () => ({
        populate: () => ({
          populate: () => ({
            lean: () => ({
              exec: execMock,
            }),
          }),
        }),
        lean: () => ({
          exec: execMock,
        }),
      }),
      populate: () => ({
        lean: () => ({
          exec: execMock,
        }),
      }),
      lean: () => ({
        exec: execMock,
      }),
      exec: execMock,
    });
    execMock.mockResolvedValue([]);
    findOneMock.mockResolvedValue({ _id: "u1", email: "test@example.com" });
  });

  it("returns 405 for non-GET", async () => {
    const req = { method: "POST", headers: { cookie: "auth_token=token" } } as unknown as NextApiRequest;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: "Method Not Allowed" });
  });

  it("returns 401 if not authenticated", async () => {
    const req = mockReq({ q: "test" }, "");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("returns 200 with empty results if no search term", async () => {
    // Patch findOneMock to always resolve to a valid user and userCompany for this test
    findOneMock.mockResolvedValueOnce({ _id: "u1", email: "test@example.com" }) // userModel.findOne
      .mockResolvedValueOnce({ userId: "u1", companyId: "c1", role: "admin" }); // userCompanyModel.findOne
    const req = mockReq({ q: "" }); // Provide an explicit empty search term
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ results: [] });
  });
});
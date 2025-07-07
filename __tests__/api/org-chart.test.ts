// Move mock declarations BEFORE jest.mock to avoid ReferenceError
const findOneMock = jest.fn();
const createMock = jest.fn();
const saveMock = jest.fn();
const findRoleMock = jest.fn();
const updateManyMock = jest.fn();

jest.mock("@/db/models/orgChartModel", () => ({
  __esModule: true,
  default: {
    findOne: findOneMock,
    create: createMock,
  },
}));

jest.mock("@/db/models/roleModel", () => ({
  __esModule: true,
  default: {
    find: findRoleMock,
  },
}));

jest.mock("@/db/models/userCompanyModel", () => ({
  __esModule: true,
  default: {
    updateMany: updateManyMock,
  },
}));

jest.mock("@/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({
    userId: "u1",
    companyId: "c1",
  })),
}));

import handler from "@/pages/api/org-chart";
import type { NextApiRequest, NextApiResponse } from "next";

// Mocks
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

describe("/api/org-chart", () => {
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

  it("GET returns org chart and adds available roles", async () => {
    const orgChart = {
      departments: [],
      save: saveMock,
      markModified: jest.fn(),
    };
    findOneMock.mockResolvedValueOnce(orgChart);
    findRoleMock.mockResolvedValue([
      { name: "admin", companyId: "c1" },
      { name: "manager", companyId: "c1" },
      { name: "developer", companyId: "c1" },
    ]);
    saveMock.mockResolvedValue(undefined);

    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ companyId: "c1" });
    expect(findRoleMock).toHaveBeenCalledWith({ companyId: "c1" });
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        departments: expect.any(Array),
      })
    );
  });

  it("GET creates org chart if not exists", async () => {
    findOneMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({
      departments: [],
      save: saveMock,
      markModified: jest.fn(),
    });
    findRoleMock.mockResolvedValue([]);
    saveMock.mockResolvedValue(undefined);

    const req = mockReq("GET");
    const res = mockRes();
    await handler(req, res);

    expect(createMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        departments: expect.any(Array),
      })
    );
  });

  it("POST updates org chart and userCompany departments", async () => {
    const orgChart = {
      departments: [],
      save: saveMock,
      markModified: jest.fn(),
    };
    findOneMock.mockResolvedValueOnce(orgChart);
    saveMock.mockResolvedValue(undefined);
    updateManyMock.mockResolvedValue(undefined);

    const req = mockReq("POST", {
      departments: [
        {
          id: "dept1",
          name: "Dept 1",
          levels: [
            { id: "lvl1", roles: ["manager"] },
            { id: "lvl2", roles: ["developer"] },
          ],
        },
      ],
    });
    const res = mockRes();
    await handler(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ companyId: "c1" });
    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: "manager", companyId: "c1" }),
      expect.any(Object)
    );
    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: "developer", companyId: "c1" }),
      expect.any(Object)
    );
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Org chart updated successfully." });
  });

  it("POST creates org chart if not exists", async () => {
    findOneMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({});
    const req = mockReq("POST", { departments: [] });
    const res = mockRes();
    await handler(req, res);
    expect(createMock).toHaveBeenCalledWith({ departments: [], companyId: "c1" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Org chart created successfully." });
  });

  it("returns 405 for unsupported method", async () => {
    const req = mockReq("PUT");
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalled();
  });
});

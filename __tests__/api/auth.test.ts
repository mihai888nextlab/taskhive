// Patch the default exports to be constructors for "new" usage before importing handlers
const userModelMock = Object.assign(
  function UserModelMock(this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ ...data, _id: "u1" });
  },
  {
    findOne: jest.fn(),
    findById: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  }
);

const companyModelMock = Object.assign(
  function CompanyModelMock(this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ ...data, _id: "c1" });
  },
  {
    findById: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  }
);

const userCompanyModelMock = Object.assign(
  function UserCompanyModelMock(this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ ...data, _id: "uc1" });
  },
  {
    findOne: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  }
);

jest.mock("../../src/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/db/models/userModel", () => ({
  __esModule: true,
  default: userModelMock,
}));
jest.mock("../../src/db/models/companyModel", () => ({
  __esModule: true,
  default: companyModelMock,
}));
jest.mock("../../src/db/models/userCompanyModel", () => ({
  __esModule: true,
  default: userCompanyModelMock,
}));

import registerHandler from "../../src/pages/api/auth/register";
import loginHandler from "../../src/pages/api/auth/login";
import logoutHandler from "../../src/pages/api/auth/logout";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

import userModel from "../../src/db/models/userModel";
import companyModel from "../../src/db/models/companyModel";
import userCompanyModel from "../../src/db/models/userCompanyModel";

// Mock bcrypt and jwt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedpw"),
  compareSync: jest.fn((pw: string, hash: string) => pw === "pw" && hash === "hashedpw"),
}));
jest.mock("cookie", () => ({
  serialize: jest.fn(() => "auth_token=token; Path=/; HttpOnly"),
}));

jest.spyOn(jwt, "sign").mockImplementation(() => "signedtoken");

function mockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.end = jest.fn();
  return res as NextApiResponse;
}

function mockReq(method: string, body: any = {}, cookies = true) {
  return {
    method,
    headers: { cookie: cookies ? `auth_token=token` : "" },
    body,
    query: {},
  } as unknown as NextApiRequest;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "testsecret";

  // Patch the default exports to be constructors for "new" usage
  (userModel as any).default = function (data: any) { return { ...data, save: jest.fn().mockResolvedValue({ ...data, _id: "u1" }) }; };
  (companyModel as any).default = function (data: any) { return { ...data, save: jest.fn().mockResolvedValue({ ...data, _id: "c1" }) }; };
  (userCompanyModel as any).default = function (data: any) { return { ...data, save: jest.fn().mockResolvedValue({ ...data, _id: "uc1" }) }; };
});

describe("/api/auth/register", () => {
  it("returns 405 for non-POST", async () => {
    const req = mockReq("GET");
    const res = mockRes();
    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 400 for missing fields", async () => {
    const req = mockReq("POST", { email: "", password: "", firstName: "", lastName: "", companyName: "" });
    const res = mockRes();
    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if user exists", async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue({ _id: "u1" });
    const req = mockReq("POST", { email: "a@b.com", password: "pw", firstName: "A", lastName: "B", companyName: "C" });
    const res = mockRes();
    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already in use." });
  });

  it("registers user and company", async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue(null);
    (companyModel.findById as jest.Mock).mockResolvedValue(null);

    // Patch the default export to be a constructor function for this test only
    const originalUserModel = (userModel as any).default;
    const originalCompanyModel = (companyModel as any).default;
    const originalUserCompanyModel = (userCompanyModel as any).default;

    // Patch the imported variable itself to be the constructor function
    function UserModelMock(this: any, data: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...data, _id: "u1" });
    }
    function CompanyModelMock(this: any, data: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...data, _id: "c1" });
    }
    function UserCompanyModelMock(this: any, data: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...data, _id: "uc1" });
    }

    (userModel as any).default = UserModelMock;
    (companyModel as any).default = CompanyModelMock;
    (userCompanyModel as any).default = UserCompanyModelMock;

    (userModel as any).constructor = UserModelMock;
    (companyModel as any).constructor = CompanyModelMock;
    (userCompanyModel as any).constructor = UserCompanyModelMock;

    (userModel as any).prototype = UserModelMock.prototype;
    (companyModel as any).prototype = CompanyModelMock.prototype;
    (userCompanyModel as any).prototype = UserCompanyModelMock.prototype;

    // Patch userCompanyModel.findOne().populate() to return a populated company
    (userCompanyModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "uc1",
        userId: "u1",
        companyId: {
          _id: "c1",
          name: "C",
          registrationNumber: undefined,
        },
        role: "admin",
        departmentId: "admin-department",
        permissions: ["all"],
      }),
    });

    // Patch userModel.findById to return a user object (needed for .populate or handler logic)
    (userModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        _id: "u1",
        email: "a@b.com",
        firstName: "A",
        lastName: "B",
        password: "hashedpw",
      }),
      exec: jest.fn().mockResolvedValue({
        _id: "u1",
        email: "a@b.com",
        firstName: "A",
        lastName: "B",
        password: "hashedpw",
      }),
    });

    const req = mockReq("POST", {
      email: "a@b.com",
      password: "pw",
      firstName: "A",
      lastName: "B",
      companyName: "C",
      companyRegistrationNumber: "", // Ensure this matches what your handler expects
    });
    const res = mockRes();

    // Mock bcrypt.hash if your handler uses it directly (not just compareSync)
    const bcrypt = require("bcrypt");
    bcrypt.hash.mockResolvedValue("hashedpw");

    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User and company registered successfully.",
        token: expect.any(String),
        user: expect.objectContaining({
          _id: "u1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
        }),
        company: expect.objectContaining({
          _id: "c1",
          name: "C",
        }),
      })
    );
    
    // Restore original mocks after test
    (userModel as any).default = originalUserModel;
    (companyModel as any).default = originalCompanyModel;
    (userCompanyModel as any).default = originalUserCompanyModel;
    (userModel as any).constructor = undefined;
    (companyModel as any).constructor = undefined;
    (userCompanyModel as any).constructor = undefined;
    (userModel as any).prototype = undefined;
    (companyModel as any).prototype = undefined;
    (userCompanyModel as any).prototype = undefined;
  });
});

describe("/api/auth/login", () => {
  it("returns 405 for non-POST", async () => {
    const req = mockReq("GET");
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 400 for missing fields", async () => {
    const req = mockReq("POST", { email: "", password: "" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if user not found", async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue(null);
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if password is wrong", async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue({ _id: "u1", email: "a@b.com", password: "wrongpw", firstName: "A", lastName: "B" });
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if userCompany not found", async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue({ _id: "u1", email: "a@b.com", password: "hashedpw", firstName: "A", lastName: "B" });
    (userCompanyModel.findOne as jest.Mock).mockResolvedValue(null);
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if company not found", async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue({ _id: "u1", email: "a@b.com", password: "hashedpw", firstName: "A", lastName: "B" });
    (userCompanyModel.findOne as jest.Mock).mockResolvedValue({ _id: "uc1", userId: "u1", companyId: "c1", role: "admin" });
    (companyModel.findById as jest.Mock).mockResolvedValue(null);
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 201 for valid login", async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue({ _id: "u1", email: "a@b.com", password: "hashedpw", firstName: "A", lastName: "B" });
    (userCompanyModel.findOne as jest.Mock).mockResolvedValue({ _id: "uc1", userId: "u1", companyId: "c1", role: "admin" });
    (companyModel.findById as jest.Mock).mockResolvedValue({ _id: "c1", name: "C" });

    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
});

describe("/api/auth/logout", () => {
  it("returns 200 for POST", async () => {
    const req = mockReq("POST");
    const res = mockRes();
    await logoutHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
  });

  it("returns 405 for non-POST", async () => {
    const req = mockReq("GET");
    const res = mockRes();
    await logoutHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
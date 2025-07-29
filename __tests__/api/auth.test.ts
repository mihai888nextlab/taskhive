
import registerHandler from "../../src/pages/api/auth/register";
import loginHandler from "../../src/pages/api/auth/login";
import logoutHandler from "../../src/pages/api/auth/logout";
import { NextApiRequest, NextApiResponse } from "next";

jest.mock("../../src/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/db/models/userModel", () => ({
  __esModule: true,
  default: Object.assign(
    function UserModelMock(this: any, data: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...data, _id: "u1" });
    },
    {
      findOne: jest.fn(),
      findById: jest.fn(),
      prototype: { save: jest.fn() },
    }
  ),
}));
jest.mock("../../src/db/models/companyModel", () => ({
  __esModule: true,
  default: { findById: jest.fn(), prototype: { save: jest.fn() } },
}));
jest.mock("../../src/db/models/userCompanyModel", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), prototype: { save: jest.fn() } },
}));
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedpw"),
  compareSync: jest.fn((pw: string, hash: string) => pw === "pw" && hash === "hashedpw"),
}));
jest.mock("cookie", () => ({
  serialize: jest.fn(() => "auth_token=token; Path=/; HttpOnly"),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "signedtoken"),
}));

// Mock GoogleGenerativeAIEmbeddings for register handler
jest.mock("@langchain/google-genai", () => ({
  GoogleGenerativeAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  })),
}));

// Mock RecursiveCharacterTextSplitter for register handler
jest.mock("langchain/text_splitter", () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    createDocuments: jest.fn().mockResolvedValue([{ pageContent: "chunked content" }]),
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
});

describe("/api/auth/register", () => {
  it("returns 405 for non-POST", async () => {
    const req = mockReq("GET");
    const res = mockRes();
    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 400 for missing fields", async () => {
    const req = mockReq("POST", { email: "", password: "", firstName: "", lastName: "" });
    const res = mockRes();
    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if user exists", async () => {
    const userModel = require("../../src/db/models/userModel").default;
    userModel.findOne.mockResolvedValue({ _id: "u1" });
    const req = mockReq("POST", { email: "a@b.com", password: "pw", firstName: "A", lastName: "B" });
    const res = mockRes();
    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already in use." });
  });

  it("registers user", async () => {
    const userModel = require("../../src/db/models/userModel").default;
    userModel.findOne.mockResolvedValue(null);
    const req = mockReq("POST", { email: "a@b.com", password: "pw", firstName: "A", lastName: "B" });
    const res = mockRes();
    await registerHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User and company registered successfully.",
        token: expect.any(String),
        user: expect.objectContaining({
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
        }),
        company: null,
      })
    );
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
    const userModel = require("../../src/db/models/userModel").default;
    userModel.findOne.mockResolvedValue(null);
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if password is wrong", async () => {
    const userModel = require("../../src/db/models/userModel").default;
    userModel.findOne.mockResolvedValue({ _id: "u1", email: "a@b.com", password: "wrongpw", firstName: "A", lastName: "B" });
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 201 and company: null if userCompany not found", async () => {
    const userModel = require("../../src/db/models/userModel").default;
    const userCompanyModel = require("../../src/db/models/userCompanyModel").default;
    userModel.findOne.mockResolvedValue({ _id: "u1", email: "a@b.com", password: "hashedpw", firstName: "A", lastName: "B" });
    userCompanyModel.findOne.mockResolvedValue(null);
    // companyModel.findById should not be called in this case
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User and company registered successfully.",
        token: expect.any(String),
        user: expect.objectContaining({
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
        }),
        company: null,
      })
    );
  });

  it("returns 400 if company not found", async () => {
    const userModel = require("../../src/db/models/userModel").default;
    const userCompanyModel = require("../../src/db/models/userCompanyModel").default;
    const companyModel = require("../../src/db/models/companyModel").default;
    userModel.findOne.mockResolvedValue({ _id: "u1", email: "a@b.com", password: "hashedpw", firstName: "A", lastName: "B" });
    userCompanyModel.findOne.mockResolvedValue({ _id: "uc1", userId: "u1", companyId: "c1", role: "admin" });
    companyModel.findById.mockResolvedValue(null);
    const req = mockReq("POST", { email: "a@b.com", password: "pw" });
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 201 for valid login", async () => {
    const userModel = require("../../src/db/models/userModel").default;
    const userCompanyModel = require("../../src/db/models/userCompanyModel").default;
    const companyModel = require("../../src/db/models/companyModel").default;
    userModel.findOne.mockResolvedValue({ _id: "u1", email: "a@b.com", password: "hashedpw", firstName: "A", lastName: "B" });
    userCompanyModel.findOne.mockResolvedValue({ _id: "uc1", userId: "u1", companyId: "c1", role: "admin" });
    companyModel.findById.mockResolvedValue({ _id: "c1", name: "C" });
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
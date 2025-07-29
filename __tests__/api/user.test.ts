import { createUserHandler } from "../../src/pages/api/user";
import type { NextApiRequest, NextApiResponse } from "next";

jest.mock("../../src/db/dbConfig", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret";
});

describe("/api/user handler", () => {
  const mockUser = { _id: "123", firstName: "Test", lastName: "User", email: "test@example.com" };
  const mockUserCompany = { role: "admin", companyId: "company123" };

  // Chainable mock for Mongoose
  function createUserModelMock(user: any, error?: any) {
    return {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: error
        ? jest.fn().mockRejectedValue(error)
        : jest.fn().mockResolvedValue(user),
    };
  }

  const userModel = createUserModelMock(mockUser);
  const userCompanyModel = {
    findOne: jest.fn().mockResolvedValue(mockUserCompany),
    find: jest.fn(), // Add find as a mock function to satisfy type checker
  };
  const dbConnect = jest.fn().mockResolvedValue(undefined);
  const jwtVerify = jest.fn().mockReturnValue({ userId: "123", companyId: "company123" });

  const handler = createUserHandler({
    userModel: userModel as any,
    userCompanyModel: userCompanyModel as any,
    dbConnect,
    jwtVerify,
  });

  const mockRes = () => {
    const res: Partial<NextApiResponse> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as NextApiResponse;
  };

  it("returns 200 and user data for valid token", async () => {
    const req = {
      method: "GET",
      headers: { cookie: "auth_token=validtoken" },
    } as unknown as NextApiRequest;
    const res = mockRes();

    // Patch userCompanyModel.findOne to also return a valid company object for company lookup
    userCompanyModel.findOne.mockResolvedValueOnce(mockUserCompany);
    // Patch userCompanyModel.find to return all companies for the user
    userCompanyModel.find = jest.fn().mockResolvedValue([
      { companyId: "company123", role: "admin" }
    ]);
    // Patch companyModel for company lookup
    const companyModel = {
      findById: jest.fn().mockResolvedValue({ _id: "company123", name: "Test Company" })
    };
    // Patch handler with companyModel injected
    const handlerWithCompany = createUserHandler({
      userModel: userModel as any,
      userCompanyModel: userCompanyModel as any,
      dbConnect,
      jwtVerify,
      companyModel: companyModel as any,
    });

    await handlerWithCompany(req, res);

    expect(dbConnect).toHaveBeenCalled();
    expect(jwtVerify).toHaveBeenCalledWith("validtoken", expect.any(String));
    expect(userModel.findById).toHaveBeenCalledWith("123");
    expect(userCompanyModel.findOne).toHaveBeenCalledWith({ userId: "123", companyId: "company123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: {
        ...mockUser,
        role: mockUserCompany.role,
        companyId: mockUserCompany.companyId,
        companyName: "Test Company",
        companies: [
          { id: "company123", name: "Test Company", role: "admin" }
        ]
      },
    });
  });

  it("returns 401 if no token", async () => {
    const req = {
      method: "GET",
      headers: { cookie: "" },
    } as unknown as NextApiRequest;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
  });

  it("returns 405 for non-GET", async () => {
    const req = {
      method: "POST",
      headers: { cookie: "auth_token=validtoken" },
    } as unknown as NextApiRequest;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: "Method not allowed" });
  });

  it("returns 401 for invalid token", async () => {
    const badJwtVerify = jest.fn(() => { throw new Error("bad token"); });
    const handlerBad = createUserHandler({
      userModel: userModel as any,
      userCompanyModel: userCompanyModel as any,
      dbConnect,
      jwtVerify: badJwtVerify,
    });
    const req = {
      method: "GET",
      headers: { cookie: "auth_token=badtoken" },
    } as unknown as NextApiRequest;
    const res = mockRes();

    await handlerBad(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
  });

  it("returns 404 if user not found", async () => {
    const userModelNotFound = createUserModelMock(null);
    const handlerNotFound = createUserHandler({
      userModel: userModelNotFound as any,
      userCompanyModel: userCompanyModel as any,
      dbConnect,
      jwtVerify,
    });
    const req = {
      method: "GET",
      headers: { cookie: "auth_token=validtoken" },
    } as unknown as NextApiRequest;
    const res = mockRes();

    await handlerNotFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("returns 404 if userCompany not found", async () => {
    const userCompanyModelNotFound = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
    };
    const handlerNotFound = createUserHandler({
      userModel: userModel as any,
      userCompanyModel: userCompanyModelNotFound as any,
      dbConnect,
      jwtVerify,
    });
    const req = {
      method: "GET",
      headers: { cookie: "auth_token=validtoken" },
    } as unknown as NextApiRequest;
    const res = mockRes();

    await handlerNotFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User company not found" });
  });

  it("returns 500 on internal error", async () => {
    const userModelError = createUserModelMock(mockUser, new Error("DB error"));
    const handlerError = createUserHandler({
      userModel: userModelError as any,
      userCompanyModel: userCompanyModel as any,
      dbConnect,
      jwtVerify,
    });
    const req = {
      method: "GET",
      headers: { cookie: "auth_token=validtoken" },
    } as unknown as NextApiRequest;
    const res = mockRes();

    await handlerError(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

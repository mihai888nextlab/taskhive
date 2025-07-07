// pages/api/user.ts
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import dbConnect from "@/db/dbConfig";
import companyModel from "@/db/models/companyModel";

// Allow dependency injection for easier Jest testing
export function createUserHandler(deps?: {
  userModel?: typeof userModel;
  userCompanyModel?: typeof userCompanyModel;
  dbConnect?: typeof dbConnect;
  jwtVerify?: typeof jwt.verify;
  companyModel?: typeof companyModel; // <-- add this for DI
}) {
  const _userModel = deps?.userModel || userModel;
  const _userCompanyModel = deps?.userCompanyModel || userCompanyModel;
  const _companyModel = deps?.companyModel || companyModel; // <-- fix variable name
  const _dbConnect = deps?.dbConnect || dbConnect;
  const _jwtVerify = deps?.jwtVerify || jwt.verify;

  return async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    await _dbConnect();

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decodedToken: JWTPayload;
    try {
      decodedToken = _jwtVerify(
        token,
        process.env.JWT_SECRET || ""
      ) as JWTPayload;
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
      const user = await _userModel
        .findById(decodedToken.userId)
        .select("-password")
        .lean();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userCompany = await _userCompanyModel.findOne({
        userId: decodedToken.userId,
        companyId: decodedToken.companyId,
      });

      if (!userCompany) {
        return res.status(404).json({ message: "UserCompany not found" });
      }
    
      const company = await _companyModel.findById(userCompany.companyId);

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const userCompanies = await _userCompanyModel.find({
        userId: decodedToken.userId,
      });

      const companies = await Promise.all(
        userCompanies.map(async (uc) => {
          const comp = await _companyModel.findById(uc.companyId);
          return {
            id: comp?._id.toString(),
            name: comp?.name,
            role: uc.role,
          };
        })
      );

      return res.status(200).json({
        user: {
          ...user,
          role: userCompany.role,
          companyId: userCompany.companyId,
          companyName: company.name,
          companies,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

// Default export for Next.js API route
export default createUserHandler();

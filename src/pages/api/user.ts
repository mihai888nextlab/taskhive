// pages/api/user.ts
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import dbConnect from "@/db/dbConfig";
import companyModel from "@/db/models/companyModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

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
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const user = await userModel
      .findById(decodedToken.userId)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userCompany = await userCompanyModel.findOne({
      userId: decodedToken.userId,
      companyId: decodedToken.companyId,
    });

    if (!userCompany) {
      return res.status(404).json({ message: "UserCompany not found" });
    }

    const company = await companyModel.findById(userCompany.companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const userCompanies = await userCompanyModel.find({
      userId: decodedToken.userId,
    });

    const companies = await Promise.all(
      userCompanies.map(async (uc) => {
        const comp = await companyModel.findById(uc.companyId);
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
}

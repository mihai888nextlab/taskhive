import type { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import companyModel from "@/db/models/companyModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import * as cookie from "cookie";
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { email, password, firstName, lastName, role } = req.body;

  // Basic validation
  if (!email || !password || !firstName || !lastName || !role) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const cookies = cookie.parse(req.headers.cookie || "");
    const tokenGet = cookies.auth_token;

    if (!tokenGet) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decodedToken: JWTPayload;
    try {
      decodedToken = jwt.verify(
        tokenGet,
        process.env.JWT_SECRET || ""
      ) as JWTPayload;
    } catch (jwtError: any) {
      console.error("JWT Verification Error:", jwtError);
      return res.status(402).json({ message: "Invalid or expired token" });
    }

    if (!decodedToken || !decodedToken.companyId) {
      console.error("Missing companyId in decoded token:", decodedToken);
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("auth_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: -1,
          path: "/",
        })
      );
      return res
        .status(402)
        .json({ message: "Invalid or expired token (companyId missing)" });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    const savedUser = await newUser.save();

    const savedCompany = await companyModel.findOne({
      _id: decodedToken.companyId,
    });

    if (!savedCompany) {
      console.error("Company not found for ID:", decodedToken.companyId);
      return res.status(404).json({ message: "Company not found" });
    }

    // Convert role to lowercase before saving
    const lowercaseRole = role.toLowerCase();
    const newUserCompany = new userCompanyModel({
      userId: savedUser._id,
      companyId: savedCompany._id,
      role: lowercaseRole, // Ensure role is stored in lowercase
      permissions: ["all"],
    });
    await newUserCompany.save();

    const token = sign(
      {
        userId: savedUser._id,
        email: savedUser.email,
        password: savedUser.password,
        role: newUserCompany.role, // 'admin'
        companyId: savedCompany._id,
        firstName: savedUser.firstName, // Include for client-side convenience
        lastName: savedUser.lastName, // Include for client-side convenience
      },
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 hour
    );

    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure in production
        sameSite: "lax", // Or 'strict' for more security
        maxAge: 5 * 60 * 60, // 1 hour (in seconds) - matches token expiration
        path: "/",
      })
    );

    res.status(201).json({
      message: "User and company registered successfully.",
      token, // Return the JWT token
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      },
      company: savedCompany,
    });
  } catch (dbError: any) {
    console.error("Database/Server error:", dbError);
    return res.status(500).json({
      message: "An error occurred during registration.",
      error: dbError.message,
    });
  }
}
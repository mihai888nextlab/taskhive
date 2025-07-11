import type { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import companyModel from "@/db/models/companyModel";
import userCompanyModel from "@/db/models/userCompanyModel";

const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { userId, companyName, companyRegistrationNumber } = req.body;

  // Basic validation
  if (!companyName) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  try {
    // 1. Check if the user already exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "User doesn't exist" });
    }

    const newCompany = new companyModel({
      name: companyName,
      registrationNumber: companyRegistrationNumber,
    });
    const savedCompany = await newCompany.save();

    // 5. Create the user_company entry to make the user an admin
    const newUserCompany = new userCompanyModel({
      userId: existingUser._id,
      companyId: savedCompany._id,
      role: "admin",
      departmentId: "admin-department", // <-- Add this line!
      permissions: ["all"],
    });
    await newUserCompany.save();

    const token = sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        password: existingUser.password,
        role: "admin", // 'admin'
        companyId: savedCompany._id,
        firstName: existingUser.firstName, // Include for client-side convenience
        lastName: existingUser.lastName, // Include for client-side convenience
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
        maxAge: 5 * 60 * 60 * 24, // 1 day (in seconds) - matches token expiration
        path: "/",
      })
    );

    res.status(201).json({
      message: "User and company registered successfully.",
      token, // Return the JWT token
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
      company: savedCompany,
    });
  } catch (error: any) {
    console.error("Registration error", error);
    return res.status(500).json({
      message: "An error occurred during registration.",
      error: error.message,
    });
  }
}

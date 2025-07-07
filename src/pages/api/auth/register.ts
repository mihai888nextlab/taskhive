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

  const {
    email,
    password,
    firstName,
    lastName,
    companyName,
    companyRegistrationNumber,
  } = req.body;

  // Basic validation
  if (!email || !password || !firstName || !lastName || !companyName) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  try {
    // 1. Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // 2. Hash the password
    const hashedPassword = await hash(password, 10);

    // 3. Create the user
    const newUser = new userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    const savedUser = await newUser.save();

    // 4. Create the company
    const newCompany = new companyModel({
      name: companyName,
      registrationNumber: companyRegistrationNumber,
    });
    const savedCompany = await newCompany.save();

    // 5. Create the user_company entry to make the user an admin
    const newUserCompany = new userCompanyModel({
      userId: savedUser._id,
      companyId: savedCompany._id,
      role: "admin",
      departmentId: "admin-department", // <-- Add this line!
      permissions: ["all"],
    });
    await newUserCompany.save();

    // 6.  Populate the userCompany object so we can return the company info.
    const populatedUserCompany = await userCompanyModel
      .findOne({
        userId: savedUser._id,
        companyId: savedCompany._id,
      })
      .populate("companyId");

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
        maxAge: 5 * 60 * 60 * 24, // 1 day (in seconds) - matches token expiration
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
  } catch (error: any) {
    console.error("Registration error", error);
    return res.status(500).json({
      message: "An error occurred during registration.",
      error: error.message,
    });
  }
}

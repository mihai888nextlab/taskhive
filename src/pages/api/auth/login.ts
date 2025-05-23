import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
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

  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Email or password are incorect!" });
    }

    const hashedPassword = existingUser.password;
    const isPasswordValid = bcrypt.compareSync(password, hashedPassword);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Email or password are incorect!" });
    }

    let userCompany = await userCompanyModel.findOne({
      userId: existingUser._id,
    });

    if (!userCompany) {
      return res.status(400).json({ message: "An error occured!" });
    }

    let company = await companyModel.findById(userCompany.companyId);

    if (!company) {
      return res.status(400).json({ message: "An error occured!" });
    }

    const token = sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        password: existingUser.password,
        role: userCompany.role, // 'admin'
        companyId: company._id,
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
        maxAge: 60 * 60, // 1 hour (in seconds) - matches token expiration
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
      company: company,
    });
  } catch (error: any) {
    console.error("Login error", error);
    return res.status(500).json({
      message: "An error occurred during login.",
      error: error.message,
    });
  }
}

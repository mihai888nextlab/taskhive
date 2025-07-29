import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import companyModel from "@/db/models/companyModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { nr } = req.body;

  const compId = "6888591f4ecc708796ed1eaf";
  let userId = "";

  if (nr == 1)
    userId = "688858e84ecc708796ed1eaa"; // Example user ID for nr 1
  else if (nr == 2)
    userId = "688867364ecc708796ed2087"; // Example user ID for nr 2
  else if (nr == 3)
    userId = "6888676b4ecc708796ed20a3"; // Example user ID for nr 3
  else if (nr == 4)
    userId = "6888678f4ecc708796ed20bf"; // Example user ID for nr 4
  else if (nr == 5) userId = "688867b94ecc708796ed20db"; // Example user ID for nr 5

  try {
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "Not Found" });
    }

    const userCompany = await userCompanyModel.findOne({
      userId: existingUser._id,
      companyId: compId,
    });

    const company = await companyModel.findById(compId);

    if (!company) {
      return res.status(400).json({ message: "An error occured!" });
    }

    const token = sign(
      {
        userId: userId,
        email: existingUser.email,
        password: existingUser.password,
        role: userCompany.role, // 'admin'
        companyId: compId,
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

    return res.status(201).json({
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

import dbConnect from "@/db/dbConfig";
import companyModel from "@/db/models/companyModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import userModel from "@/db/models/userModel";
import { serialize } from "cookie";
import { OAuth2Client } from "google-auth-library";
import { sign } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

const JWT_SECRET = process.env.JWT_SECRET || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL || "http://localhost:3000"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { code } = req.body;

  if (!code) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  try {
    const { tokens } = await googleClient.getToken(code);
    const { id_token, access_token } = tokens;

    if (!id_token) {
      return res.status(401).json({
        message: "No ID token received from Google after code exchange.",
      });
    }

    // 2. Verify the ID Token (optional but good practice, getToken often verifies implicitly)
    // oAuth2Client.verifyIdToken also takes the audience.
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID, // Ensure the audience matches your client ID
    });

    const payload = ticket.getPayload(); // This payload contains user info

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token." });
    }

    const existingUser = await userModel.findOne({
      email: payload.email,
      type: "google",
    });
    if (!existingUser) {
      // If user does not exist, create a new user

      const emailExists = await userModel.findOne({ email: payload.email });
      if (emailExists) {
        return res.status(400).json({
          message:
            "An account with this email already exists. Please log in with credentials.",
        });
      }

      const newUser = new userModel({
        email: payload.email,
        firstName: payload.given_name || "",
        lastName: payload.family_name || "",
        password: "NOPASSWORD", // Password is not used for Google login
        profileImage: null,
        skills: [],
        description: "",
        type: "google",
      });
      await newUser.save();

      const token = sign(
        {
          userId: newUser._id,
          email: newUser.email,
          password: newUser.password, // Not used for Google login
          role: "",
          companyId: "",
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.setHeader(
        "Set-Cookie",
        serialize("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 5 * 60 * 60 * 24,
          path: "/",
        })
      );

      return res.status(201).json({
        message: "Google login successful.",
        token,
        user: {
          _id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        company: null,
      });
    }

    const token = sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        password: existingUser.password, // Not used for Google login
        role: "",
        companyId: "",
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 60 * 24,
        path: "/",
      })
    );

    return res.status(201).json({
      message: "Google login successful.",
      token,
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
      company: null,
    });
  } catch (error: any) {
    console.error("Google login error", error);
    return res.status(500).json({
      message: "Google login failed.",
      error: error.message,
    });
  }
}

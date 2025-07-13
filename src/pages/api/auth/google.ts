import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import dbConnect from "@/db/dbConfig";
import User from "@/db/models/userModel"; // Asigură-te că ai modelul User corect importat
import { sign } from "jsonwebtoken";
import userCompanyModel from "@/db/models/userCompanyModel";
import { serialize } from "cookie";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID Token is missing" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Asigură-te că este ID-ul clientului tău
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res
        .status(400)
        .json({ message: "Invalid Google ID Token payload" });
    }

    const { email, name, given_name, family_name, picture } = payload;

    await dbConnect(); // Conectează-te la baza de date

    let user = await User.findOne({ email });

    console.log("User found:", user ? user.email : "No user found");
    console.log("Payload from Google:", payload);

    if (!user) {
      user = await User.create({
        type: "google",
        email,
        password: "NOPASSWORD", // Google users don't have a password
        firstName: given_name || name?.split(" ")[0] || "",
        lastName: family_name || name?.split(" ").slice(1).join(" ") || "",
        profileImage: null,
        skills: [],
      });
      console.log("New user created from Google auth:", user.email);
    } else {
      console.log("Existing user logged in with Google:", user.email);
      // Exemplu: actualizează imaginea de profil dacă s-a schimbat
      //   if (user.profilePicture !== picture) {
      //     user.profilePicture = picture;
      //     await user.save();
      //   }
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";

    const token = sign(
      {
        userId: user._id,
        email: user.email,
        password: user.password,
        role: "", // 'admin'
        companyId: "",
        firstName: user.firstName, // Include for client-side convenience
        lastName: user.lastName, // Include for client-side convenience
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

    // 5. Returnează succesul și informațiile despre utilizator (fără JWT sau token direct)
    return res.status(200).json({
      message: "Google authentication successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        // Include alte câmpuri necesare pentru frontend
      },
    });
  } catch (error: any) {
    console.error("Google authentication error:", error);
    if (
      error.code === "ERR_INVALID_ARG_VALUE" &&
      error.message.includes("audience")
    ) {
      return res.status(401).json({
        message: "Invalid Google Client ID configuration on backend.",
      });
    }
    return res
      .status(401)
      .json({ message: "Authentication failed", details: error.message });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Clear the authentication cookie or session
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

      // Respond with success
      res.status(200).json({ message: "Logout successful" });
      // redirect("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: "Method not allowed" });
  }
}

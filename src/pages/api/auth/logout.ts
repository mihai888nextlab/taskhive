import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      
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

      
      res.status(200).json({ message: "Logout successful" });
      
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: "Method not allowed" });
  }
}

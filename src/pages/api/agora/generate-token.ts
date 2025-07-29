import type { NextApiRequest, NextApiResponse } from "next";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import dbConnect from "@/db/dbConfig";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";


const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

const verifyAuthToken = async (req: NextApiRequest) => {
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return;
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch {
    return;
  }

  try {
    const user = await userModel
      .findById(decodedToken.userId)
      .select("-password");

    if (!user) {
      return;
    }

    return user;
  } catch (error) {
    return;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  
  const authResult = await verifyAuthToken(req);
  if (!authResult || !authResult._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { _id: userId } = authResult;
  const { channelName } = req.body;

  if (!channelName) {
    return res.status(400).json({ message: "Channel name is required." });
  }
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    console.error(
      "Agora App ID or App Certificate not set in environment variables."
    );
    return res.status(500).json({ message: "Server configuration error." });
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + expirationTimeInSeconds;
  const tokenExpire = currentTimestamp + expirationTimeInSeconds;

  const uid = 0;

  const role = RtcRole.PUBLISHER;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      role,
      tokenExpire,
      privilegeExpire
    );

    return res
      .status(200)
      .json({ token, appId: AGORA_APP_ID, uid, name: authResult.name });
  } catch (error) {
    console.error("Error generating Agora token:", error);
    return res.status(500).json({ message: "Failed to generate Agora token." });
  }
}

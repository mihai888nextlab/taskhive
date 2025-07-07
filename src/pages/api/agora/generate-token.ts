import type { NextApiRequest, NextApiResponse } from "next";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import dbConnect from "@/db/dbConfig";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.body || typeof req.body.channelName === "undefined") {
    return res.status(400).json({ message: "Channel name is required." });
  }
  const { channelName } = req.body;

  let user;
  try {
    const userQuery = userModel.findById(decodedToken.userId).select("-password");
    user = typeof userQuery.lean === "function"
      ? await (typeof userQuery.lean().exec === "function"
        ? userQuery.lean().exec()
        : userQuery.lean())
      : await userQuery;
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!user || !user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // --- FIX: Read env vars inside handler, not at module scope ---
  const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    return res.status(500).json({ message: "Server configuration error." });
  }

  const expirationTimeInSeconds = 3600; // Token valid pentru 1 oră
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

    return res.status(200).json({ token, appId: AGORA_APP_ID, uid });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate Agora token." });
  }
}
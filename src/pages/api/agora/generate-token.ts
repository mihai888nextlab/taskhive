// pages/api/agora-generate-token.ts (Modified to support RTM tokens)
import type { NextApiRequest, NextApiResponse } from "next";
import { RtcRole, RtcTokenBuilder, RtmTokenBuilder } from "agora-token"; // Import RtmTokenBuilder
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

  const userId = decodedToken.userId; // This is your MongoDB user ID

  let user;
  try {
    const userQuery = userModel.findById(userId).select("-password");
    user =
      typeof userQuery.lean === "function"
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

  const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    return res.status(500).json({ message: "Server configuration error." });
  }

  const expirationTimeInSeconds = 3600; // Token valid for 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + expirationTimeInSeconds;
  const tokenExpire = currentTimestamp + expirationTimeInSeconds;
  // Note: For RTM, the channelName is not directly part of the token generation,
  // but the RTM SDK uses your userId to join specific channels.

  const { channelName, tokenType } = req.body; // Add tokenType to distinguish RTC/RTM

  if (tokenType === "rtc") {
    // --- RTC Token Generation (Existing Logic) ---
    if (typeof channelName === "undefined") {
      return res
        .status(400)
        .json({ message: "RTC: Channel name is required." });
    }
    const uid = 0; // Or use user._id.hashCode() if you need a numeric UID
    const role = RtcRole.PUBLISHER;

    try {
      const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        uid, // For RTC, uid can be 0 (wildcard) or a specific numeric ID
        role,
        tokenExpire,
        privilegeExpire
      );

      return res.status(200).json({ token, appId: AGORA_APP_ID, uid });
    } catch (error) {
      console.error("RTC Token generation error:", error);
      return res.status(500).json({ message: "Failed to generate RTC token." });
    }
  } else if (tokenType === "rtm") {
    // --- RTM Token Generation (New Logic) ---
    // Agora RTM uses a string userId for its tokens, which is perfect for your MongoDB _id
    const rtmUid = user._id.toString(); // Use your user's MongoDB _id as the RTM UID

    try {
      const token = RtmTokenBuilder.buildToken(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        rtmUid,
        privilegeExpire // RTM tokens use a single expiration time for login privilege
      );
      return res.status(200).json({ token, appId: AGORA_APP_ID, rtmUid });
    } catch (error) {
      console.error("RTM Token generation error:", error);
      return res.status(500).json({ message: "Failed to generate RTM token." });
    }
  } else {
    return res
      .status(400)
      .json({ message: "Invalid tokenType. Must be 'rtc' or 'rtm'." });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import dbConnect from "@/db/dbConfig";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";

// Variabile de mediu (le vei seta în .env.local și pe Vercel)
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID; // Public, dar e bine să-l iei din env
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE; // SECRET! DOAR ÎN BACKEND!

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

  // 1. Verifică autentificarea utilizatorului
  const authResult = await verifyAuthToken(req);
  if (!authResult || !authResult._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { _id: userId } = authResult; // ID-ul utilizatorului autentificat
  const { channelName } = req.body; // Numele canalului la care vrei să te conectezi

  if (!channelName) {
    return res.status(400).json({ message: "Channel name is required." });
  }
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    console.error(
      "Agora App ID or App Certificate not set in environment variables."
    );
    return res.status(500).json({ message: "Server configuration error." });
  }

  // Generarea token-ului Agora RTC
  const expirationTimeInSeconds = 3600; // Token valid pentru 1 oră
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + expirationTimeInSeconds;
  const tokenExpire = currentTimestamp + expirationTimeInSeconds;

  // UID-ul utilizatorului în Agora. Poate fi 0 pentru a lăsa Agora să-l genereze,
  // sau un număr întreg unic pentru fiecare utilizator (ex: userId-ul tău convertit la int)
  // Recomandat: Folosește un UID numeric unic pentru fiecare utilizator din aplicația ta.
  // Pentru simplitate, aici folosim 0 (Agora va aloca un UID).
  const uid = 0; // Sau parseInt(userId, 10) dacă userId-ul tău e numeric și unic

  // Rolul utilizatorului: PUBLISHER (poate trimite și primi stream-uri) sau SUBSCRIBER (doar primește)
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
    console.error("Error generating Agora token:", error);
    return res.status(500).json({ message: "Failed to generate Agora token." });
  }
}

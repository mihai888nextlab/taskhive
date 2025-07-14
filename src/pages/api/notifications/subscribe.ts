// pages/api/notifications/subscribe.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import PushSubscription from "@/db/models/pushSubscriptionModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

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
    return res
      .status(401)
      .json({ message: "Authentication required: No token provided" });
  }

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authentication required: Invalid token" });
  }

  const userId = decodedToken.userId; // Extract userId from the decoded token
  const subscription = req.body; // This is the PushSubscription object

  // Basic validation for the subscription object
  if (
    !subscription ||
    !subscription.endpoint ||
    !subscription.keys ||
    !subscription.keys.p256dh ||
    !subscription.keys.auth
  ) {
    return res.status(400).json({ message: "Invalid subscription object." });
  }

  try {
    // Find and update if exists, otherwise create new
    const existingSubscription = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint }, // Find by endpoint (which should be unique)
      { userId, ...subscription }, // Update with new data (e.g., if userId changes for same endpoint)
      { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found, return new doc
    );

    console.log(
      `Subscription saved/updated for user ${userId}: ${existingSubscription.endpoint}`
    );
    return res
      .status(201)
      .json({ message: "Subscription saved successfully." });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error (endpoint is unique)
      console.warn(
        `Duplicate subscription attempt for endpoint: ${subscription.endpoint}`
      );
      return res.status(200).json({ message: "Subscription already exists." });
    }
    console.error("Error saving subscription:", error);
    return res.status(500).json({ message: "Failed to save subscription." });
  }
}

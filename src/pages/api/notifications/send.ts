// pages/api/notifications/send.ts
import { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";
import dbConnect from "@/db/dbConfig";
import PushSubscription from "@/db/models/pushSubscriptionModel"; // Adjust the path to your model
import mongoose from "mongoose";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  "mailto:help@taskhive.tech", // Replace with your actual email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // You might want to authenticate this endpoint differently
  // e.g., only allow internal server calls, or specific roles.
  // For now, let's assume an authenticated user can trigger a notification for themselves or others.

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

  if (!decodedToken || !decodedToken.userId) {
    console.error("Missing userId in decoded token:", decodedToken);
    return res
      .status(401)
      .json({ message: "Authentication required: Invalid token" });
  }

  const { targetUserId, title, body, icon, url } = req.body; // targetUserId is who to send to

  if (!targetUserId || !title || !body) {
    return res
      .status(400)
      .json({ message: "Missing targetUserId, title, or body." });
  }

  await dbConnect();

  try {
    // Find all subscriptions for the target user
    const subscriptions = await PushSubscription.find({
      userId: new mongoose.Types.ObjectId(targetUserId),
    });

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${targetUserId}.`);
      return res
        .status(200)
        .json({ message: "No subscriptions found for this user." });
    }

    const notificationPayload = JSON.stringify({
      title: title,
      body: body,
      icon: icon || "/icons/notification-icon.png", // Default icon
      url: url || "/", // URL to open when notification is clicked
    });

    const pushPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.toObject(), notificationPayload);
        console.log(`Notification sent to ${sub.endpoint}`);
      } catch (pushError: any) {
        console.error(
          `Failed to send notification to ${sub.endpoint}:`,
          pushError
        );
        // If the push service returns a 404 or 410, the subscription is no longer valid
        // and should be removed from your database.
        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          console.warn(
            `Removing expired/invalid subscription: ${sub.endpoint}`
          );
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    });

    await Promise.allSettled(pushPromises); // Use allSettled to wait for all, even if some fail

    return res
      .status(200)
      .json({ message: "Notifications sent (or attempted)." });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return res.status(500).json({ message: "Failed to send notifications." });
  }
}

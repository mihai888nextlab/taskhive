import { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";
import dbConnect from "@/db/dbConfig";
import PushSubscription from "@/db/models/pushSubscriptionModel";
import mongoose from "mongoose";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

webpush.setVapidDetails(
  "mailto:help@taskhive.tech",
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

  const { targetUserId, title, body, icon, url } = req.body;

  if (!targetUserId || !title || !body) {
    return res
      .status(400)
      .json({ message: "Missing targetUserId, title, or body." });
  }

  await dbConnect();

  try {
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
        icon: icon || "/icons/notification-icon.png",
        url: url || "/",
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
        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          console.warn(
            `Removing expired/invalid subscription: ${sub.endpoint}`
          );
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    });

      await Promise.allSettled(pushPromises);

    return res
      .status(200)
      .json({ message: "Notifications sent (or attempted)." });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return res.status(500).json({ message: "Failed to send notifications." });
  }
}

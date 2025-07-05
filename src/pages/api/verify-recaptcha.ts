import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: "No reCAPTCHA secret key configured" });
  }

  try {
    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      }
    );
    const data = await verifyRes.json();

    // Debug: log the full response for troubleshooting
    console.log("reCAPTCHA verify response:", data);

    // If running on localhost, always allow for dev/testing
    if (process.env.NODE_ENV !== "production" && (req.headers.host?.startsWith("localhost") || req.headers.host?.startsWith("127.0.0.1"))) {
      return res.status(200).json({ success: true, devBypass: true, score: data.score ?? null, action: data.action ?? null });
    }

    if (!data.success) {
      let errorMsg = "Unknown error from Google reCAPTCHA";
      if (Array.isArray(data["error-codes"])) {
        if (data["error-codes"].includes("invalid-input-secret")) {
          errorMsg = "Invalid reCAPTCHA secret key. Check your backend .env.";
        } else if (data["error-codes"].includes("invalid-input-response")) {
          errorMsg = "Invalid reCAPTCHA token. Try reloading the page.";
        } else if (data["error-codes"].includes("timeout-or-duplicate")) {
          errorMsg = "reCAPTCHA token expired. Please try again.";
        } else if (data["error-codes"].includes("bad-request")) {
          errorMsg = "Browser error: reCAPTCHA request was malformed. Try refreshing the page.";
        } else {
          errorMsg = data["error-codes"].join(", ");
        }
      }
      return res.status(400).json({ 
        success: false, 
        error: errorMsg, 
        errorCodes: data["error-codes"] || [],
        score: data.score ?? null, 
        action: data.action ?? null 
      });
    }

    return res.status(200).json({ success: true, score: data.score ?? null, action: data.action ?? null });
  } catch (err) {
    // Log the error for debugging
    console.error("reCAPTCHA verification failed:", err);
    return res.status(500).json({ error: "Failed to verify reCAPTCHA" });
  }
}
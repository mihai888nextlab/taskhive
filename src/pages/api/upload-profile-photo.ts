import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import userModel from "@/db/models/userModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import fs from "fs";
import dbConnect from "@/db/dbConfig";

export const config = {
  api: { bodyParser: false },
};

function parseForm(req: NextApiRequest) {
  const form = formidable({ maxFiles: 1, maxFileSize: 5 * 1024 * 1024 });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API HIT");

  await dbConnect();
  console.log("DB Connected");

  if (req.method !== "POST") {
    console.log("Wrong method:", req.method);
    return res.status(405).end();
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;
  if (!token) {
    console.log("No token");
    return res.status(401).json({ message: "No token" });
  }

  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
    console.log("JWT decoded:", decoded);
  } catch (err) {
    console.log("JWT error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const { fields, files } = await parseForm(req);
    console.log("Parsed files:", files);
    const uploaded = files.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (!file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const data = await fs.promises.readFile(file.filepath);
    const base64 = data.toString("base64");
    const contentType = file.mimetype || "image/png";
    const fileName = file.originalFilename || "profile.png";

    await userModel.findByIdAndUpdate(decoded.userId, {
      profileImage: {
        data: `data:${contentType};base64,${base64}`,
        contentType,
        uploadedAt: new Date(),
        fileName,
      },
    });

    console.log("Profile image updated");
    return res.status(200).json({
      profileImage: {
        data: `data:${contentType};base64,${base64}`,
        contentType,
        fileName,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
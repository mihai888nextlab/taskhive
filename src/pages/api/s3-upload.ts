import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import filesModel from "@/db/models/filesModel";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decodedToken: JWTPayload | null = jwt.verify(
    token,
    process.env.JWT_SECRET || ""
  ) as JWTPayload;

  try {
    const { file, fileName, fileType } = req.body;
    const buffer = Buffer.from(file, "base64");

    const newFileName = Date.now() + fileName;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: newFileName,
      Body: buffer,
      ContentType: fileType,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const newFIle = await filesModel.create({
      fileName: fileName,
      fileType,
      fileLocation: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newFileName}`,
      uploadedBy: decodedToken.userId,
      fileSize: buffer.length,
    });

    return res.status(200).json({
      url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newFileName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import signatureModel from "@/db/models/signatureModel";
import dbConnect from "@/db/dbConfig";

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

  await dbConnect();

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
    const { signature, signatureName } = req.body;
    const buffer = Buffer.from(signature, "base64");

    const fileName = `signature_${Date.now()}_${decodedToken.userId}.png`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `signatures/${fileName}`,
      Body: buffer,
      ContentType: "image/png",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const signatureUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/signatures/${fileName}`;

    const newSignature = await signatureModel.create({
      signatureName,
      signatureUrl,
      uploadedBy: decodedToken.userId,
    });

    return res.status(200).json({
      signature: newSignature,
      url: signatureUrl,
    });
  } catch (error) {
    console.error("Signature upload error:", error);
    return res.status(500).json({ error: "Failed to upload signature" });
  }
}
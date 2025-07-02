import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import dbConnect from "@/db/dbConfig";
import filesModel from "@/db/models/filesModel";

interface JWTPayload {
  userId: string;
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { 
      fileId, 
      signatureUrl, 
      signatureSize,
      clickPosition,
      previewDimensions,
      normalizedPosition,
      contentDimensions,
      fileType,
      saveOption = 'new' // Default to creating new copy
    } = req.body;

    const hasOldFormat = clickPosition && previewDimensions;
    const hasNewFormat = normalizedPosition && contentDimensions;

    if (!fileId || !signatureUrl || !signatureSize || (!hasOldFormat && !hasNewFormat)) {
      return res.status(400).json({ 
        message: "Missing required fields",
        received: { 
          fileId: !!fileId, 
          signatureUrl: !!signatureUrl, 
          signatureSize: !!signatureSize,
          hasOldFormat,
          hasNewFormat
        }
      });
    }

    const originalFile = await filesModel.findById(fileId);
    
    if (!originalFile) {
      return res.status(404).json({ message: "File not found" });
    }

    if (originalFile.uploadedBy.toString() !== decoded.userId) {
      return res.status(403).json({ message: "Not authorized to sign this file" });
    }

    const isPdfFile = originalFile.fileType === "application/pdf";
    const isImageFile = originalFile.fileType?.startsWith("image/");

    if (isPdfFile) {
      try {
        const { PDFDocument } = await import("pdf-lib");
        
        let finalClickPosition, finalPreviewDimensions;
        
        if (hasNewFormat) {
          finalClickPosition = {
            x: normalizedPosition.x * contentDimensions.width,
            y: normalizedPosition.y * contentDimensions.height
          };
          finalPreviewDimensions = contentDimensions;
        } else {
          finalClickPosition = clickPosition;
          finalPreviewDimensions = previewDimensions;
        }
        
        const signedPdfBuffer = await addSignatureToPdf(
          originalFile.fileLocation,
          signatureUrl,
          finalClickPosition,
          signatureSize,
          finalPreviewDimensions,
          PDFDocument
        );

        if (saveOption === 'replace') {
          // Replace the original file
          const uploadedFile = await uploadToS3(signedPdfBuffer, originalFile.fileName, "application/pdf");
          
          // Update the existing file record
          originalFile.fileLocation = uploadedFile.Location;
          originalFile.fileSize = signedPdfBuffer.length;
          await originalFile.save();

          return res.status(200).json({
            message: "File signed and updated successfully",
            signedFile: {
              _id: originalFile._id,
              fileName: originalFile.fileName,
              fileLocation: originalFile.fileLocation,
            },
            action: 'replaced'
          });
        } else {
          // Create new copy (default behavior)
          const signedFileName = `signed_${Date.now()}_${originalFile.fileName}`;
          const uploadedFile = await uploadToS3(signedPdfBuffer, signedFileName, "application/pdf");

          const signedFile = new filesModel({
            fileName: signedFileName,
            fileType: "application/pdf",
            fileLocation: uploadedFile.Location,
            fileSize: signedPdfBuffer.length,
            uploadedBy: decoded.userId,
          });

          await signedFile.save();

          return res.status(200).json({
            message: "New signed copy created successfully",
            signedFile: {
              _id: signedFile._id,
              fileName: signedFile.fileName,
              fileLocation: signedFile.fileLocation,
            },
            action: 'new_copy'
          });
        }

      } catch (pdfError) {
        return res.status(500).json({ 
          message: "PDF processing failed", 
          error: pdfError instanceof Error ? pdfError.message : "Unknown PDF error" 
        });
      }

    } else if (isImageFile) {
      if (!hasOldFormat) {
        return res.status(400).json({
          message: "Click position and preview dimensions are required for image signing",
        });
      }
      return res.status(400).json({
        message: "Image signing not implemented yet. Please use PDF files.",
      });
    } else {
      return res.status(400).json({
        message: "File type not supported for signing. Currently only PDFs are supported.",
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : String(error),
      type: typeof error
    });
  }
}

async function uploadToS3(buffer: Buffer, fileName: string, contentType: string) {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
      throw new Error("Missing AWS environment variables");
    }

    const AWS = await import("aws-sdk");

    const s3 = new AWS.default.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `signed-files/${Date.now()}-${fileName}`,
      Body: buffer,
      ContentType: contentType,
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    
    return uploadResult;
  } catch (error) {
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function addSignatureToPdf(
  pdfUrl: string,
  signatureUrl: string,
  clickPosition: { x: number; y: number },
  signatureSize: { width: number; height: number },
  previewDimensions: { width: number; height: number },
  PDFDocument: any
): Promise<Buffer> {
  try {
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();

    const signatureResponse = await fetch(signatureUrl);
    if (!signatureResponse.ok) {
      throw new Error(`Failed to fetch signature: ${signatureResponse.status} ${signatureResponse.statusText}`);
    }
    const signatureArrayBuffer = await signatureResponse.arrayBuffer();

    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);

    let signatureImage;
    if (signatureUrl.includes('data:image/png') || signatureUrl.includes('.png')) {
      signatureImage = await pdfDoc.embedPng(signatureArrayBuffer);
    } else {
      signatureImage = await pdfDoc.embedJpg(signatureArrayBuffer);
    }

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width: actualPdfWidth, height: actualPdfHeight } = firstPage.getSize();

    // Calculate the scaling factors from iframe to PDF
    const iframeAspectRatio = previewDimensions.width / previewDimensions.height;
    const pdfAspectRatio = actualPdfWidth / actualPdfHeight;
    
    let scaledPdfWidth, scaledPdfHeight, offsetX = 0, offsetY = 0;
    
    const paddingFactor = 0.95;
    
    if (iframeAspectRatio > pdfAspectRatio) {
      scaledPdfHeight = previewDimensions.height * paddingFactor;
      scaledPdfWidth = scaledPdfHeight * pdfAspectRatio;
      offsetX = (previewDimensions.width - scaledPdfWidth) / 2;
      offsetY = (previewDimensions.height - scaledPdfHeight) / 2;
    } else {
      scaledPdfWidth = previewDimensions.width * paddingFactor;
      scaledPdfHeight = scaledPdfWidth / pdfAspectRatio;
      offsetX = (previewDimensions.width - scaledPdfWidth) / 2;
      offsetY = (previewDimensions.height - scaledPdfHeight) / 2;
    }
    
    // Convert iframe coordinates to PDF coordinates
    const pdfRelativeX = clickPosition.x - offsetX;
    const pdfRelativeY = clickPosition.y - offsetY;
    
    // Scale from iframe PDF size to actual PDF size
    const scaleX = actualPdfWidth / scaledPdfWidth;
    const scaleY = actualPdfHeight / scaledPdfHeight;
    
    // Calculate actual PDF coordinates
    const actualPdfX = Math.max(0, Math.min(scaledPdfWidth, pdfRelativeX)) * scaleX;
    const yOffset = actualPdfHeight * 0.01;
    const actualPdfY = actualPdfHeight - (Math.max(0, Math.min(scaledPdfHeight, pdfRelativeY)) * scaleY) + yOffset;
    
    // Scale signature size to actual PDF size
    const actualSignatureWidth = (signatureSize.width / scaledPdfWidth) * actualPdfWidth;
    const actualSignatureHeight = (signatureSize.height / scaledPdfHeight) * actualPdfHeight;
    
    // Center signature on click point
    const signatureX = actualPdfX - (actualSignatureWidth / 2);
    const signatureY = actualPdfY - (actualSignatureHeight / 2);
    
    // Ensure signature stays within PDF bounds
    const boundedX = Math.max(0, Math.min(actualPdfWidth - actualSignatureWidth, signatureX));
    const boundedY = Math.max(0, Math.min(actualPdfHeight - actualSignatureHeight, signatureY));

    firstPage.drawImage(signatureImage, {
      x: boundedX,
      y: boundedY,
      width: actualSignatureWidth,
      height: actualSignatureHeight,
      opacity: 0.9,
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    
    return buffer;
  } catch (error) {
    throw new Error(`PDF signature failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
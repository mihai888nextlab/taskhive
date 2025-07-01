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
  console.log("🚀 SIGN FILE API CALLED");
  console.log("Method:", req.method);

  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    console.log("❌ Method not allowed");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("📦 Request body:", req.body);

    console.log("🔌 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected successfully");

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;
    console.log("🔑 Token found:", !!token);

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JWTPayload;
      console.log("✅ Token decoded successfully, userId:", decoded.userId);
    } catch (err) {
      console.error("❌ JWT verification error:", err);
      return res.status(401).json({ message: "Invalid token" });
    }

    // Handle both old format (clickPosition/previewDimensions) and new format (normalizedPosition/contentDimensions)
    const { 
      fileId, 
      signatureUrl, 
      signatureSize,
      clickPosition,          // Old format for images
      previewDimensions,      // Old format for images
      normalizedPosition,     // New format for PDFs
      contentDimensions,      // New format for PDFs
      fileType 
    } = req.body;
    
    console.log("📋 Request data:", { 
      fileId, 
      hasSignature: !!signatureUrl, 
      clickPosition,
      previewDimensions,
      normalizedPosition,
      contentDimensions,
      signatureSize,
      fileType
    });

    // Validate required fields based on format
    const hasOldFormat = clickPosition && previewDimensions;
    const hasNewFormat = normalizedPosition && contentDimensions;

    if (!fileId || !signatureUrl || !signatureSize || (!hasOldFormat && !hasNewFormat)) {
      console.log("❌ Missing required fields");
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

    console.log("🔍 Looking up file with ID:", fileId);
    const originalFile = await filesModel.findById(fileId);
    
    if (!originalFile) {
      console.error("❌ File not found:", fileId);
      return res.status(404).json({ message: "File not found" });
    }

    console.log("✅ File found:", originalFile.fileName, "Type:", originalFile.fileType);

    if (originalFile.uploadedBy.toString() !== decoded.userId) {
      console.log("❌ User not authorized");
      return res.status(403).json({ message: "Not authorized to sign this file" });
    }

    const isPdfFile = originalFile.fileType === "application/pdf";
    const isImageFile = originalFile.fileType?.startsWith("image/");
    
    console.log("📄 File type check:", { isPdfFile, isImageFile, actualType: originalFile.fileType });

    if (isPdfFile) {
      console.log("🔄 Processing PDF file...");
      
      try {
        console.log("📚 Importing pdf-lib...");
        const { PDFDocument } = await import("pdf-lib");
        console.log("✅ pdf-lib imported successfully");

        console.log("🔄 Adding signature to PDF...");
        
        let finalClickPosition, finalPreviewDimensions;
        
        if (hasNewFormat) {
          // Convert normalized position back to pixel coordinates
          finalClickPosition = {
            x: normalizedPosition.x * contentDimensions.width,
            y: normalizedPosition.y * contentDimensions.height
          };
          finalPreviewDimensions = contentDimensions;
          console.log("📐 Using new format - normalized position converted:", {
            normalizedPosition,
            contentDimensions,
            convertedClickPosition: finalClickPosition
          });
        } else {
          // Use old format directly
          finalClickPosition = clickPosition;
          finalPreviewDimensions = previewDimensions;
          console.log("📐 Using old format:", { clickPosition, previewDimensions });
        }
        
        const signedPdfBuffer = await addSignatureToPdf(
          originalFile.fileLocation,
          signatureUrl,
          finalClickPosition,
          signatureSize,
          finalPreviewDimensions,
          PDFDocument
        );
        console.log("✅ PDF signature completed, buffer size:", signedPdfBuffer.length);

        console.log("☁️ Uploading to S3...");
        const signedFileName = `signed_${Date.now()}_${originalFile.fileName}`;
        const uploadedFile = await uploadToS3(signedPdfBuffer, signedFileName, "application/pdf");
        console.log("✅ S3 upload completed");

        console.log("💾 Saving to database...");
        const signedFile = new filesModel({
          fileName: signedFileName,
          fileType: "application/pdf",
          fileLocation: uploadedFile.Location,
          fileSize: signedPdfBuffer.length,
          uploadedBy: decoded.userId,
        });

        await signedFile.save();
        console.log("✅ Database save completed, ID:", signedFile._id);

        return res.status(200).json({
          message: "File signed successfully",
          signedFile: {
            _id: signedFile._id,
            fileName: signedFile.fileName,
            fileLocation: signedFile.fileLocation,
          },
        });

      } catch (pdfError) {
        console.error("❌ PDF processing error:", pdfError);
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
    console.error("💥 MAIN ERROR:");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : String(error),
      type: typeof error
    });
  }
}

async function uploadToS3(buffer: Buffer, fileName: string, contentType: string) {
  console.log("☁️ === S3 UPLOAD FUNCTION ===");
  
  try {
    const envVars = {
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    };
    console.log("🔧 Environment check:", envVars);

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
      throw new Error("Missing AWS environment variables");
    }

    console.log("📦 Importing AWS SDK...");
    const AWS = await import("aws-sdk");
    console.log("✅ AWS SDK imported");

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

    console.log("🚀 Starting upload with params:", {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      BufferSize: buffer.length
    });

    const uploadResult = await s3.upload(uploadParams).promise();
    console.log("✅ S3 upload successful:", uploadResult.Location);
    
    return uploadResult;
  } catch (error) {
    console.error("❌ S3 upload error:", error);
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Update the addSignatureToPdf function to handle iframe coordinates better:

async function addSignatureToPdf(
  pdfUrl: string,
  signatureUrl: string,
  clickPosition: { x: number; y: number },
  signatureSize: { width: number; height: number },
  previewDimensions: { width: number; height: number },
  PDFDocument: any
): Promise<Buffer> {
  console.log("📄 === PDF SIGNATURE FUNCTION ===");
  console.log("🖱️ Click position:", clickPosition);
  console.log("📏 Signature size:", signatureSize);
  console.log("📐 Preview dimensions:", previewDimensions);
  
  try {
    console.log("🌐 Fetching PDF from:", pdfUrl.substring(0, 50) + "...");
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log("✅ PDF fetched, size:", pdfArrayBuffer.byteLength);

    console.log("🖊️ Fetching signature...");
    const signatureResponse = await fetch(signatureUrl);
    if (!signatureResponse.ok) {
      throw new Error(`Failed to fetch signature: ${signatureResponse.status} ${signatureResponse.statusText}`);
    }
    const signatureArrayBuffer = await signatureResponse.arrayBuffer();
    console.log("✅ Signature fetched, size:", signatureArrayBuffer.byteLength);

    console.log("📖 Loading PDF document...");
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    console.log("✅ PDF loaded");

    console.log("🖼️ Embedding signature image...");
    let signatureImage;
    if (signatureUrl.includes('data:image/png') || signatureUrl.includes('.png')) {
      signatureImage = await pdfDoc.embedPng(signatureArrayBuffer);
    } else {
      signatureImage = await pdfDoc.embedJpg(signatureArrayBuffer);
    }
    console.log("✅ Signature embedded");

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width: actualPdfWidth, height: actualPdfHeight } = firstPage.getSize();
    console.log("📏 Actual PDF page dimensions:", actualPdfWidth, "x", actualPdfHeight);

    // Calculate the scaling factors from iframe to PDF
    // The iframe shows the PDF with some padding and potentially different aspect ratio
    
    // For most PDF viewers, the PDF is scaled to fit within the iframe with some padding
    // Common PDF viewer behavior:
    // - The PDF is centered in the iframe
    // - It's scaled to fit while maintaining aspect ratio
    // - There's usually some padding around the edges
    
    const iframeAspectRatio = previewDimensions.width / previewDimensions.height;
    const pdfAspectRatio = actualPdfWidth / actualPdfHeight;
    
    let scaledPdfWidth, scaledPdfHeight, offsetX = 0, offsetY = 0;
    
    // Estimate how the PDF is displayed in the iframe
    const paddingFactor = 0.95; // Most PDF viewers have some padding
    
    if (iframeAspectRatio > pdfAspectRatio) {
      // Iframe is wider than PDF - PDF height fills iframe height, centered horizontally
      scaledPdfHeight = previewDimensions.height * paddingFactor;
      scaledPdfWidth = scaledPdfHeight * pdfAspectRatio;
      offsetX = (previewDimensions.width - scaledPdfWidth) / 2;
      offsetY = (previewDimensions.height - scaledPdfHeight) / 2;
    } else {
      // Iframe is taller than PDF - PDF width fills iframe width, centered vertically
      scaledPdfWidth = previewDimensions.width * paddingFactor;
      scaledPdfHeight = scaledPdfWidth / pdfAspectRatio;
      offsetX = (previewDimensions.width - scaledPdfWidth) / 2;
      offsetY = (previewDimensions.height - scaledPdfHeight) / 2;
    }
    
    console.log("🔄 PDF display calculations:", {
      iframeSize: previewDimensions,
      actualPdfSize: { width: actualPdfWidth, height: actualPdfHeight },
      scaledPdfSize: { width: scaledPdfWidth, height: scaledPdfHeight },
      offset: { x: offsetX, y: offsetY },
      aspectRatios: { iframe: iframeAspectRatio, pdf: pdfAspectRatio }
    });
    
    // Convert iframe coordinates to PDF coordinates
    // First, adjust for the PDF's position within the iframe
    const pdfRelativeX = clickPosition.x - offsetX;
    const pdfRelativeY = clickPosition.y - offsetY;
    
    // Check if click is within the PDF area
    if (pdfRelativeX < 0 || pdfRelativeX > scaledPdfWidth || 
        pdfRelativeY < 0 || pdfRelativeY > scaledPdfHeight) {
      console.log("⚠️ Click position is outside PDF bounds, adjusting...");
      // Clamp to PDF bounds
      const clampedX = Math.max(0, Math.min(scaledPdfWidth, pdfRelativeX));
      const clampedY = Math.max(0, Math.min(scaledPdfHeight, pdfRelativeY));
      console.log("🔧 Clamped position:", { x: clampedX, y: clampedY });
    }
    
    // Scale from iframe PDF size to actual PDF size
    const scaleX = actualPdfWidth / scaledPdfWidth;
    const scaleY = actualPdfHeight / scaledPdfHeight;
    
    // Calculate actual PDF coordinates
    const actualPdfX = Math.max(0, Math.min(scaledPdfWidth, pdfRelativeX)) * scaleX;
    // Increase the Y position by adding an offset to move signature higher
    const actualPdfY = actualPdfHeight - (Math.max(0, Math.min(scaledPdfHeight, pdfRelativeY)) * scaleY) + (actualPdfHeight * 0.014); // Add 10% of page height to move signature up
    
    // Scale signature size to actual PDF size
    const actualSignatureWidth = (signatureSize.width / scaledPdfWidth) * actualPdfWidth;
    const actualSignatureHeight = (signatureSize.height / scaledPdfHeight) * actualPdfHeight;
    
    // Center signature on click point
    const signatureX = actualPdfX - (actualSignatureWidth / 2);
    const signatureY = actualPdfY - (actualSignatureHeight / 2);
    
    // Ensure signature stays within PDF bounds
    const boundedX = Math.max(0, Math.min(actualPdfWidth - actualSignatureWidth, signatureX));
    const boundedY = Math.max(0, Math.min(actualPdfHeight - actualSignatureHeight, signatureY));

    console.log("📍 Final signature placement:", {
      iframeClick: clickPosition,
      pdfRelative: { x: pdfRelativeX, y: pdfRelativeY },
      actualPdfCoords: { x: actualPdfX, y: actualPdfY },
      signatureSize: { width: actualSignatureWidth, height: actualSignatureHeight },
      finalPosition: { x: boundedX, y: boundedY },
      scalingFactors: { x: scaleX, y: scaleY }
    });

    firstPage.drawImage(signatureImage, {
      x: boundedX,
      y: boundedY,
      width: actualSignatureWidth,
      height: actualSignatureHeight,
      opacity: 0.9,
    });

    console.log("💾 Saving PDF...");
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    console.log("✅ PDF saved, buffer size:", buffer.length);
    
    return buffer;
  } catch (error) {
    console.error("❌ PDF signature error:", error);
    throw new Error(`PDF signature failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
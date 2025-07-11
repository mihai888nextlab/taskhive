// scripts/ingest.ts
import mongoose from "mongoose";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dbConnect from "../../../db/dbConfig"; // Import your models
import Task from "../../../db/models/taskModel";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "rag_database";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "text-embedding-004", // Or the latest appropriate embedding model
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500, // Adjust based on context window and content density
  chunkOverlap: 100, // Important for maintaining context
});

/**
 * Helper function to process and update documents in a specific collection.
 * @param model The Mongoose Model (e.g., Task, Announcement)
 * @param sourceName A string identifying the source (e.g., 'task', 'announcement', 'user')
 * @param contentExtractor A function that takes a document and returns the string for pageContent.
 **/
async function processAndEmbedCollection(
  model: mongoose.Model<any>,
  sourceName: string,
  contentExtractor: (doc: any) => string,
  metadataExtractor: (doc: any) => any = (doc) => ({}) // Optional: Extract additional metadata
) {
  console.log(`--- Processing ${sourceName} data ---`);
  // Fetch documents. .lean() makes them plain JS objects, which is often faster for processing.
  const documents = await model.find({}).lean();

  if (documents.length === 0) {
    console.log(`No ${sourceName} documents found to process.`);
    return;
  }

  for (const doc of documents) {
    const rawPageContent = contentExtractor(doc);
    if (!rawPageContent || rawPageContent.trim() === "") {
      console.warn(
        `Skipping ${sourceName} document ${doc._id}: No relevant content extracted.`
      );
      continue;
    }

    // Split content into chunks (even if it's just one chunk for short docs)
    const chunks = await splitter.createDocuments([rawPageContent]);

    // For simplicity, we'll embed the first chunk.
    // If your documents are very long and contain distinct sections,
    // you might need a more advanced strategy:
    // 1. Create multiple chunks per document.
    // 2. Embed each chunk.
    // 3. Store multiple embeddings (and corresponding chunk text) for a single original document.
    //    This would involve changing `embedding: number[]` to `embeddings: number[][]` and
    //    `pageContent: string` to `pageContents: string[]` in your schemas.
    const embedding = await embeddings.embedQuery(chunks[0].pageContent);

    // Combine default metadata with extracted custom metadata
    const combinedMetadata = {
      source: sourceName,
      originalId: doc._id,
      ...metadataExtractor(doc),
    };

    // Update the original document in MongoDB with the RAG fields
    try {
      await model.updateOne(
        { _id: doc._id },
        {
          $set: {
            pageContent: chunks[0].pageContent, // Store the primary chunk content
            embedding: embedding,
            metadata: combinedMetadata, // Store enhanced metadata
          },
        }
      );
      console.log(`Updated ${sourceName} document ${doc._id} with RAG data.`);
    } catch (updateError) {
      console.error(
        `Failed to update ${sourceName} document ${doc._id}:`,
        updateError
      );
    }
  }
}

async function ingestAllData() {
  if (!MONGODB_URI || !GEMINI_API_KEY) {
    console.error("Missing MONGODB_URI or GEMINI_API_KEY in .env.local");
    process.exit(1);
  }

  try {
    await dbConnect(); // Connect using your Mongoose utility

    // Process each collection with its specific content and metadata extractors
    await processAndEmbedCollection(
      Task,
      "task",
      (doc: any) =>
        `Task Title: ${doc.title}. Description: ${doc.description}. Status: ${doc.status}. Due Date: ${doc.dueDate?.toLocaleDateString() || "N/A"}. Assigned To: ${doc.assignedTo}`,
      (doc: any) => ({ taskTitle: doc.title, taskStatus: doc.status })
    );

    // await processAndEmbedCollection(
    //   Announcement,
    //   'announcement',
    //   (doc: any) => `Announcement Title: ${doc.title}. Content: ${doc.content}. Published by: ${doc.author}. Published on: ${doc.createdAt?.toLocaleDateString() || 'N/A'}`,
    //   (doc: any) => ({ announcementTitle: doc.title, announcementAuthor: doc.author })
    // );

    // await processAndEmbedCollection(
    //   User,
    //   'user',
    //   (doc: any) => `User Name: ${doc.name}. Email: ${doc.email}. Role: ${doc.role}. Bio: ${doc.bio || 'N/A'}`,
    //   (doc: any) => ({ userName: doc.name, userRole: doc.role })
    // );

    // Add calls for other models here, e.g.:
    // await processAndEmbedCollection(Project, 'project', (doc) => `Project: ${doc.name}. Details: ${doc.details}`);
    // await processAndEmbedCollection(Comment, 'comment', (doc) => `Comment: ${doc.text}. By: ${doc.author}`);

    console.log("\n--- All data ingestion complete! ---");
  } catch (error) {
    console.error("Error during overall data ingestion:", error);
  } finally {
    // Only disconnect if this script is meant to run and exit.
    // If it's part of a continuous process, keep the connection open.
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

ingestAllData();

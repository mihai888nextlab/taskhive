import mongoose from "mongoose";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dbConnect from "../../../db/dbConfig";
import Task from "../../../db/models/taskModel";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "rag_database";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "text-embedding-004",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

async function processAndEmbedCollection(
  model: mongoose.Model<any>,
  sourceName: string,
  contentExtractor: (doc: any) => string,
  metadataExtractor: (doc: any) => any = (doc) => ({}) // Optional: Extract additional metadata
) {
  console.log(`--- Processing ${sourceName} data ---`);
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

    const chunks = await splitter.createDocuments([rawPageContent]);

    const embedding = await embeddings.embedQuery(chunks[0].pageContent);

    const combinedMetadata = {
      source: sourceName,
      originalId: doc._id,
      ...metadataExtractor(doc),
    };

    try {
      await model.updateOne(
        { _id: doc._id },
        {
          $set: {
            pageContent: chunks[0].pageContent,
            embedding: embedding,
            metadata: combinedMetadata,
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
    await dbConnect();

    await processAndEmbedCollection(
      Task,
      "task",
      (doc: any) =>
        `Task Title: ${doc.title}. Description: ${doc.description}. Status: ${doc.status}. Due Date: ${doc.dueDate?.toLocaleDateString() || "N/A"}. Assigned To: ${doc.assignedTo}`,
      (doc: any) => ({ taskTitle: doc.title, taskStatus: doc.status })
    );

    console.log("\n--- All data ingestion complete! ---");
  } catch (error) {
    console.error("Error during overall data ingestion:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

ingestAllData();

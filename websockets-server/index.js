// backend/index.js (or server.js)
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// --- Import your DB models and connection ---
const dbConnect = require("./db/dbConfig");
const messagesModel = require("./db/models/messagesModel");
const conversationsModel = require("./db/models/conversationsModel");
const userModel = require("./db/models/userModel");

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  path: "/api/socket",
  addTrailingSlash: false,
});

dbConnect();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room: ${conversationId}`);
  });

  socket.on("sendMessage", async (data) => {
    // data: { conversationId: string; senderId: string; content: string; type?: "text" | "file"; }
    console.log("Message received:", data);

    try {
      const newMessage = new messagesModel({
        conversationId: data.conversationId,
        senderId: data.senderId, // This is just the ID from the client
        content: data.content,
        type: data.type || "text",
      });
      await newMessage.save();

      await conversationsModel.updateOne(
        { _id: data.conversationId },
        { $set: { updatedAt: new Date(), lastMessage: data.content } }
      );

      // Fetch sender details exactly as in your original code
      let senderIdData = await userModel
        .findById(data.senderId)
        .select("firstName lastName email"); // Original fields selected

      // Emit the message to all clients in the room, with senderIdData as the senderId field
      io.to(data.conversationId).emit("messageReceived", {
        _id: newMessage._id, // Send the saved message with its DB ID
        conversationId: data.conversationId,
        senderId: senderIdData, // Send the entire fetched user object for senderId
        content: data.content,
        type: data.type || "text",
        timestamp: newMessage.createdAt.toISOString(), // Use createdAt from DB
      });
      console.log(`Message sent to room ${data.conversationId}`);
    } catch (error) {
      console.error("Error saving or sending message:", error);
      socket.emit("messageError", "Failed to send message.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Allowed CORS Origins: ${allowedOrigins.join(", ")}`);
});

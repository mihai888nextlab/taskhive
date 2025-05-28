import { Server as IOServer } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as HttpServer } from "http";
import { parse } from "url";

// Augment the type of res.socket.server to include io
import type { Socket as NetSocket } from "net";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HttpServer & { io?: IOServer };
  };
};

// This handles initial connection and events
const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log("Socket.io already running");
    res.end();
    return;
  }

  console.log("Starting Socket.io server...");

  const io = new IOServer(res.socket.server, {
    path: "/api/socket", // IMPORTANT: This path must match client-side
    addTrailingSlash: false, // Prevents issues with Next.js router
  });

  res.socket.server.io = io; // Attach io to the server socket

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific room based on conversation ID
    // In a real app, you'd authenticate the user and authorize joining rooms
    socket.on("joinRoom", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined room: ${conversationId}`);
    });

    // Handle sending a message
    socket.on(
      "sendMessage",
      async (data: {
        conversationId: string;
        senderId: string;
        content: string;
      }) => {
        console.log("Message received:", data);
        // TODO: Authenticate senderId
        // TODO: Validate conversationId and senderId against participants

        // Save message to DB
        try {
          // await dbConnect(); // Ensure DB connection
          // const newMessage = new Message({
          //   conversationId: data.conversationId,
          //   senderId: data.senderId,
          //   content: data.content,
          //   timestamp: new Date(),
          // });
          // await newMessage.save();

          // Emit the message to all clients in the room
          io.to(data.conversationId).emit("messageReceived", {
            // _id: newMessage._id, // Send the saved message with its DB ID
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            timestamp: new Date().toISOString(), // Use ISO string for consistency
          });
          console.log(`Message sent to room ${data.conversationId}`);
        } catch (error) {
          console.error("Error saving or sending message:", error);
          // Handle error (e.g., emit an error back to sender)
          socket.emit("messageError", "Failed to send message.");
        }
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  res.end(); // Important: signal that the API route has finished processing
};

export default SocketHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};

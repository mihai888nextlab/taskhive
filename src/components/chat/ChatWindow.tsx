// components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "@/pages/_app";
import { IConversation } from "@/db/models/conversationsModel";
import { IUser } from "@/db/models/userModel";

// Ensure these types match your backend models and API responses
interface ChatMessage {
  _id?: string;
  conversationId: string;
  senderId: string | IUser;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  readBy?: string[];
}

interface ChatWindowProps {
  selectedConversation: (IConversation & { participants: IUser[] }) | null; // Pass the whole convo object
}

let socket: ReturnType<typeof io>; // Declare socket outside to prevent re-initialization

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedConversation }) => {
  const { user } = useAuth(); // Current logged-in user
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = selectedConversation?._id?.toString(); // Extract ID from conversation object

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Socket.IO connection and event listeners
  useEffect(() => {
    if (!user || !conversationId) return;

    // Only establish connection if not already connected or if conversationId changes
    if (
      !socket ||
      socket.disconnected ||
      socket.io.opts.query?.conversationId !== conversationId
    ) {
      if (socket) socket.disconnect(); // Disconnect previous socket if exists

      socket = io({
        path: "/api/socket",
        query: { conversationId, userId: user._id }, // Pass context data to server
      });

      socket.on("connect", () => {
        console.log(`Socket.io connected for conversation: ${conversationId}`);
        socket.emit("joinRoom", conversationId);
      });

      socket.on("disconnect", () => {
        console.log("Socket.io disconnected");
      });

      socket.on("messageReceived", (message: ChatMessage) => {
        console.log("New message received:", message);
        setMessages((prevMessages) => {
          // Prevent duplicates if component re-renders quickly
          if (prevMessages.find((m) => m._id === message._id)) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      });

      socket.on("messageError", (errorMessage: string) => {
        console.error("Message send error:", errorMessage);
        setError(`Eroare la trimiterea mesajului: ${errorMessage}`);
      });
    }

    // Clean up on component unmount or conversation change
    return () => {
      // Don't disconnect if socket is used by another instance or if it's the same conversation
      if (
        socket &&
        socket.connected &&
        socket.io.opts.query?.conversationId === conversationId
      ) {
        // Keep socket open if still on same conversation
      } else if (socket) {
        socket.disconnect(); // Disconnect if changing conversation or unmounting
      }
    };
  }, [conversationId, user]);

  // 2. Fetch initial messages (REST API)
  useEffect(() => {
    if (!user || !conversationId) {
      setMessages([]); // Clear messages if no conversation is selected
      return;
    }

    const fetchInitialMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`
        );
        if (!res.ok) throw new Error("Failed to fetch initial messages");
        const data = await res.json();
        // Assuming messages come with senderId populated
        setMessages(data.messages as ChatMessage[]);
      } catch (err: any) {
        console.error("Error fetching initial messages:", err);
        setError("Nu s-au putut încărca mesajele.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchInitialMessages();
  }, [conversationId, user]);

  // 3. Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessageContent.trim() && user && socket && socket.connected) {
      const messageData = {
        conversationId,
        senderId: user._id,
        content: newMessageContent.trim(),
        type: "text" as "text", // Explicitly type for safety
      };
      socket.emit("sendMessage", messageData);
      setNewMessageContent("");
      setError(null); // Clear any previous errors
    } else if (!newMessageContent.trim()) {
      setError("Mesajul nu poate fi gol.");
    } else if (!socket || !socket.connected) {
      setError("Chat-ul nu este conectat. Te rugăm să încerci din nou.");
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-xl">Selectează o conversație sau începe una nouă</p>
      </div>
    );
  }

  const getParticipantNames = (
    participants: IUser[],
    currentUserId: string
  ): string => {
    if (selectedConversation.type === "direct") {
      const otherParticipant = participants.find(
        (p) => (p._id as string).toString() !== currentUserId
      );
      return otherParticipant
        ? `${otherParticipant.firstName || ""} ${
            otherParticipant.lastName || ""
          }`.trim() || otherParticipant.email
        : "Conversație Directă";
    }
    return selectedConversation.name || "Grup Fără Nume";
  };

  const currentChatName = getParticipantNames(
    selectedConversation.participants,
    user?._id || ""
  );

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-md">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-lg text-gray-800">
          {currentChatName}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loadingMessages ? (
          <div className="text-center text-gray-500">
            Se încarcă mesajele...
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            Fii primul care trimite un mesaj!
          </div>
        ) : (
          messages.map((msg) => {
            const isSender = msg.senderId === user?._id;
            const senderInfo =
              typeof msg.senderId === "object" ? msg.senderId : null;
            const senderName = isSender
              ? "Eu"
              : senderInfo
              ? `${senderInfo.firstName || ""} ${
                  senderInfo.lastName || ""
                }`.trim() || senderInfo.email
              : "Unknown";

            return (
              <div
                key={msg._id || Math.random()} // Fallback for key if _id is not immediately available
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-xl ${
                    isSender
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <div className="font-semibold text-xs mb-1">{senderName}</div>
                  <p className="text-sm break-words">{msg.content}</p>
                  <span className="text-xs opacity-75 mt-1 block text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-gray-50 flex space-x-2"
      >
        <input
          type="text"
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          placeholder="Scrie un mesaj..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!user || loadingMessages}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!user || loadingMessages || !newMessageContent.trim()}
        >
          Trimite
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

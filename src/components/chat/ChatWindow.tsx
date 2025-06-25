// components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "@/hooks/useAuth"; // Custom hook to get current user
import { IUser } from "@/db/models/userModel";
import { PopulatedConversation } from "./ConversationList";
import Loading from "@/components/Loading";
import { BsPaperclip } from "react-icons/bs";
import FileCard from "@/components/storage/StorageFileCard";
import { useTheme } from "@/components/ThemeContext"; // Import the useTheme hook

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
  selectedConversation: PopulatedConversation | null; // Pass the whole convo object
}

let socket: ReturnType<typeof io>; // Declare socket outside to prevent re-initialization

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedConversation }) => {
  const { user } = useAuth(); // Current logged-in user
  const { theme } = useTheme(); // Get the current theme
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilesDropdown, setShowFilesDropdown] = useState(false);
  const [userFiles, setUserFiles] = useState<
    { fileName: string; fileLocation: string; fileSize: number }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = selectedConversation?._id?.toString(); // Extract ID from conversation object

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Socket.IO connection and event listeners
  useEffect(() => {
    if (!user || !conversationId) return;

    if (
      !socket ||
      socket.disconnected ||
      socket.io.opts.query?.conversationId !== conversationId
    ) {
      if (socket) socket.disconnect();

      socket = io({
        path: "/api/socket",
        query: { conversationId, userId: user._id },
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
          if (prevMessages.some((m) => m._id === message._id)) {
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

    return () => {
      if (
        socket &&
        socket.connected &&
        socket.io.opts.query?.conversationId === conversationId
      ) {
        // Keep socket open if still on same conversation
      } else if (socket) {
        socket.disconnect();
      }
    };
  }, [conversationId, user]);

  // 2. Fetch initial messages (REST API)
  useEffect(() => {
    if (!user || !conversationId) {
      setMessages([]);
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
        setMessages(data.messages as ChatMessage[]);
      } catch (err) {
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
        type: "text" as const, // Explicitly type for safety
      };
      socket.emit("sendMessage", messageData);
      setNewMessageContent("");
      setError(null);
    } else if (!newMessageContent.trim()) {
      setError("Message cannot be empty!");
    } else if (!socket || !socket.connected) {
      setError("Chat-ul nu este conectat. Te rugăm să încerci din nou.");
    }
  };

  // Fetch user files when dropdown is opened
  useEffect(() => {
    if (showFilesDropdown && user) {
      fetch("/api/getFiles")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.files)) {
            type UserFile = {
              fileName: string;
              fileLocation: string;
              fileSize?: number;
              uploadedBy: string;
            };
            setUserFiles(
              (data.files as UserFile[])
                .filter((f) => f.uploadedBy === user._id)
                .map((f) => ({
                  fileName: f.fileName,
                  fileLocation: f.fileLocation,
                  fileSize: f.fileSize || 0, // Ensure fileSize is always a number
                }))
            );
          }
        });
    }
  }, [showFilesDropdown, user]);

  const handleSendFile = (
    fileUrl: string,
    fileName: string,
    fileSize: number
  ) => {
    if (user && socket && socket.connected && conversationId) {
      const messageData = {
        conversationId,
        senderId: user._id,
        content: JSON.stringify({ fileUrl, fileName, fileSize }),
        type: "file" as const,
      };
      socket.emit("sendMessage", messageData);
      setShowFilesDropdown(false);
      setError(null);
    }
  };

  if (!selectedConversation) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full text-gray-600 bg-${
          theme === "light" ? "white" : "gray-800"
        } rounded-lg p-6 shadow-md`}
      >
        <p className="text-xl font-semibold text-white">
          Selectează o conversație sau începe una nouă
        </p>
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
    // Containerul principal al ferestrei de chat.
    <div
      className={`flex flex-col h-full bg-${
        theme === "light" ? "white" : "gray-900"
      } rounded-lg text-${theme === "light" ? "gray-800" : "white"} shadow-md`}
    >
      {/* Antetul Chatului - mai mult contrast și stilizare - cu efect de Glassmorphism */}
      <div
        className={`p-4 border-b border-gray-300 bg-${
          theme === "light" ? "white" : "gray-800"
        } rounded-t-lg shadow-[0_4px_15px_rgba(0,0,0,0.08)] backdrop-filter backdrop-blur-md z-10`}
      >
        {" "}
        {/* Fundal translucid, umbră personalizată, efect de blur */}
        <h3 className="font-semibold text-lg text-white">{currentChatName}</h3>
      </div>

      {/* Zona de Mesaje - acum cu umbră internă pentru mai multă profunzime și fundal subtil */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar shadow-inner bg-${
          theme === "light" ? "gray-50" : "gray-800"
        }`}
      >
        {" "}
        {/* Fundal gri foarte subtil, umbră internă pentru efect de "adâncime" */}
        {loadingMessages ? (
          <div className="text-center text-gray-600">
            <Loading />
            <p className="mt-2 text-white">Se încarcă mesajele...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-600">
            Fii primul care trimite un mesaj!
          </div>
        ) : (
          messages.map((msg) => {
            const isSender =
              (typeof msg.senderId === "object"
                ? msg.senderId._id
                : msg.senderId) === user?._id;
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
                key={msg._id || Math.random()}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-xl ${
                    // Colțuri mai rotunjite, umbră personalizată, efect de hover amplificat
                    isSender
                      ? "bg-blue-500 text-white rounded-br-none ring-1 ring-blue-300"
                      : "bg-gray-700 text-white rounded-bl-none ring-1 ring-gray-600"
                  }`}
                >
                  <div
                    className={`font-semibold text-xs mb-1 ${
                      isSender ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {senderName}
                  </div>
                  {msg.type === "file" ? (
                    (() => {
                      let fileData: {
                        fileUrl: string;
                        fileName: string;
                        fileSize?: number;
                      } | null = null;
                      try {
                        fileData = JSON.parse(msg.content);
                      } catch {
                        fileData = null;
                      }
                      return fileData ? (
                        <FileCard
                          fileName={fileData.fileName}
                          fileSize={fileData.fileSize || 0}
                          downloadUrl={fileData.fileUrl}
                          theme="light" // iara trebe schimbat aici
                        />
                      ) : (
                        <span className="text-red-500 text-xs">
                          Fișier invalid
                        </span>
                      );
                    })()
                  ) : (
                    <p className="text-sm break-words">{msg.content}</p>
                  )}
                  <span
                    className={`text-xs opacity-75 mt-1 block text-right ${
                      isSender ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
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

      {/* Formular de Trimitere Mesaj - cu butonul de atașament în stânga inputului */}
      <form
        onSubmit={handleSendMessage}
        className={`p-4 border-t border-gray-300 bg-${
          theme === "light" ? "white" : "gray-800"
        } flex space-x-2 rounded-b-lg shadow-[0_4px_15px_rgba(0,0,0,0.08)] backdrop-filter backdrop-blur-md z-10`}
      >
        <button
          type="button"
          className="flex items-center justify-center bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition mr-2"
          onClick={() => setShowFilesDropdown((v) => !v)}
          tabIndex={-1}
        >
          <BsPaperclip className="text-xl" />
        </button>
        {showFilesDropdown && (
          <div className="absolute bottom-20 left-8 bg-white border rounded-lg shadow-lg z-50 w-64 max-h-64 overflow-y-auto">
            <div className="p-2 font-semibold border-b">Fișierele mele</div>
            {userFiles.length === 0 ? (
              <div className="p-2 text-gray-500">Nu ai fișiere încărcate.</div>
            ) : (
              userFiles.map((file) => (
                <button
                  key={file.fileLocation}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() =>
                    handleSendFile(
                      file.fileLocation,
                      file.fileName,
                      file.fileSize
                    )
                  } // Assuming size is not needed here
                  type="button"
                >
                  {file.fileName}
                </button>
              ))
            )}
          </div>
        )}
        <input
          type="text"
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          placeholder="Scrie un mesaj..."
          className={`flex-1 p-2 border border-gray-400 bg-${
            theme === "light" ? "white" : "gray-800"
          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-${
            theme === "light" ? "gray-800" : "white"
          } placeholder-gray-500 transition-all duration-200 ease-in-out`}
          disabled={!user || loadingMessages}
        />
        <button
          type="submit"
          className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold`}
          disabled={!user || loadingMessages || !newMessageContent.trim()}
        >
          Trimite
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

// components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { IUser } from "@/db/models/userModel";
import { PopulatedConversation } from "./ConversationList";
import Loading from "@/components/Loading";
import { BsPaperclip } from "react-icons/bs";
import FileCard from "@/components/storage/StorageFileCard";
import { useTheme } from "@/components/ThemeContext";
import { useRouter } from "next/router";
import { FiSend, FiVideo, FiPhone, FiMoreVertical, FiUsers, FiMessageCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";

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
  selectedConversation: PopulatedConversation | null;
}

let socket: ReturnType<typeof io>;

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedConversation }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilesDropdown, setShowFilesDropdown] = useState(false);
  const [userFiles, setUserFiles] = useState<
    { fileName: string; fileLocation: string; fileSize: number }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = selectedConversation?._id?.toString();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Socket.IO connection and event listeners
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
        setError(`Error sending message: ${errorMessage}`);
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

  // Fetch initial messages
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
        setError("Could not load messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchInitialMessages();
  }, [conversationId, user]);

  // Auto-scroll to bottom on new messages
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
        type: "text" as const,
      };
      socket.emit("sendMessage", messageData);
      setNewMessageContent("");
      setError(null);
    } else if (!newMessageContent.trim()) {
      setError("Message cannot be empty!");
    } else if (!socket || !socket.connected) {
      setError("Chat is not connected. Please try again.");
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
                  fileSize: f.fileSize || 0,
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
      <div className={`flex flex-col items-center justify-center h-full ${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-2xl border ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FiMessageCircle className={`w-12 h-12 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          </div>
          <h3 className={`text-2xl font-bold mb-3 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
            Welcome to Messages
          </h3>
          <p className={`text-lg ${theme === "light" ? "text-gray-600" : "text-gray-400"} mb-6`}>
            Select a conversation or start a new chat to begin messaging
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>💬 Connect with your team members</p>
            <p>🔒 Secure and private messaging</p>
            <p>📁 Share files and media</p>
          </div>
        </div>
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
        : "Direct Chat";
    }
    return selectedConversation.name || "Group Chat";
  };

  const currentChatName = getParticipantNames(
    selectedConversation.participants,
    user?._id || ""
  );

  const handleVideoCall = () => {
    router.push(
      `/app/video-call/${encodeURIComponent(selectedConversation._id)}`
    );
  };

  const getMessageAvatar = (senderId: string | IUser) => {
    const senderInfo = typeof senderId === "object" ? senderId : null;
    if (senderInfo?.profileImage?.data) {
      return (
        <img
          src={senderInfo.profileImage.data}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    const initial = senderInfo?.firstName?.[0] || senderInfo?.email?.[0] || "U";
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'}`}>
        {initial.toUpperCase()}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-2xl border ${theme === "light" ? "border-gray-200" : "border-gray-700"} overflow-hidden`}>
      {/* Chat Header */}
      <div className={`p-6 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Chat Avatar */}
            <div className="relative">
              {selectedConversation.type === "direct" ? (
                (() => {
                  const otherParticipant = selectedConversation.participants.find(
                    (p) => String(p._id) !== user?._id
                  );
                  return otherParticipant?.profileImage?.data ? (
                    <img
                      src={otherParticipant.profileImage.data}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-500'}`}>
                      {(otherParticipant?.firstName?.[0] || otherParticipant?.email?.[0] || "U").toUpperCase()}
                    </div>
                  );
                })()
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'}`}>
                  <FiUsers className="w-6 h-6" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* Chat Info */}
            <div>
              <h3 className={`text-xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                {currentChatName}
              </h3>
              <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                {selectedConversation.type === "direct" ? "Online" : `${selectedConversation.participants.length} members`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVideoCall}
              className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              <FiVideo className="w-5 h-5" />
            </button>
            <button className={`p-3 rounded-xl transition-all duration-200 ${theme === "light" ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-gray-600 hover:bg-gray-500 text-gray-300"}`}>
              <FiMoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loading />
            <p className={`mt-4 text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              Loading messages...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200 max-w-md">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FiMessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No messages yet</p>
            <p className="text-sm opacity-75">Be the first to send a message!</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {messages.map((msg, index) => {
              const isSender =
                (typeof msg.senderId === "object"
                  ? msg.senderId._id
                  : msg.senderId) === user?._id;
              const senderInfo =
                typeof msg.senderId === "object" ? msg.senderId : null;
              const senderName = isSender
                ? "You"
                : senderInfo
                ? `${senderInfo.firstName || ""} ${
                    senderInfo.lastName || ""
                  }`.trim() || senderInfo.email
                : "Unknown";

              const showAvatar = !isSender && (index === 0 || 
                (typeof messages[index - 1]?.senderId === "object" 
                  ? (typeof messages[index - 1].senderId === "object"
                      ? (messages[index - 1].senderId as IUser)._id
                      : messages[index - 1].senderId)
                  : messages[index - 1]?.senderId) !== (typeof msg.senderId === "object" ? (msg.senderId as IUser)._id : msg.senderId)
              );

              return (
                <div
                  key={msg._id || Math.random()}
                  className={`flex ${isSender ? "justify-end" : "justify-start"} items-end gap-3`}
                >
                  {/* Avatar for received messages */}
                  {!isSender && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar ? getMessageAvatar(msg.senderId) : <div className="w-8"></div>}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`max-w-[75%] ${isSender ? "order-1" : "order-2"}`}>
                    {!isSender && showAvatar && (
                      <p className="text-xs text-gray-500 mb-1 ml-1">{senderName}</p>
                    )}
                    
                    <div
                      className={`inline-block px-3 py-2 rounded-2xl transition-all duration-200 ${
                        isSender
                          ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded-br-md`
                          : theme === "light"
                          ? "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                          : "bg-gray-700 text-white rounded-bl-md"
                      }`}
                    >
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
                              theme={theme}
                            />
                          ) : (
                            <span className="text-red-500 text-sm">
                              Invalid file
                            </span>
                          );
                        })()
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}
                    </div>
                    
                    <p className={`text-xs mt-1 ${isSender ? "text-right" : "text-left"} ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className={`p-6 ${theme === "light" ? "bg-white" : "bg-gray-800"} border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          {/* File Attachment Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilesDropdown((v) => !v)}
              className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${theme === "light" ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-gray-700 hover:bg-gray-600 text-gray-300"}`}
            >
              <BsPaperclip className="w-5 h-5" />
            </button>
            
            {/* Files Dropdown */}
            {showFilesDropdown && (
              <div className={`absolute bottom-16 left-0 border rounded-2xl z-50 w-72 max-h-64 overflow-hidden ${theme === "light" ? "bg-white border-gray-200" : "bg-gray-800 border-gray-600"}`}>
                <div className={`p-4 border-b ${theme === "light" ? "border-gray-200 bg-gray-50" : "border-gray-600 bg-gray-700"}`}>
                  <h4 className={`font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                    Your Files
                  </h4>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {userFiles.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p className="text-sm">No files uploaded yet</p>
                    </div>
                  ) : (
                    userFiles.map((file) => (
                      <button
                        key={file.fileLocation}
                        className={`w-full text-left px-4 py-3 transition-colors duration-150 border-b last:border-b-0 ${theme === "light" ? "hover:bg-gray-50 border-gray-100" : "hover:bg-gray-700 border-gray-600"}`}
                        onClick={() =>
                          handleSendFile(
                            file.fileLocation,
                            file.fileName,
                            file.fileSize
                          )
                        }
                        type="button"
                      >
                        <p className={`font-medium truncate ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                          {file.fileName}
                        </p>
                        <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              className={`w-full px-4 py-3 rounded-2xl resize-none border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                theme === "light" 
                  ? "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white" 
                  : "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600"
              }`}
              rows={1}
              disabled={!user || loadingMessages}
            />
          </div>
          <Button
            type="submit"
            disabled={!user || loadingMessages || !newMessageContent.trim()}
            className={`p-3 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            <FiSend className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

import { IUser } from "@/db/models/userModel";
import { useAuth } from "@/hooks/useAuth";
import mongoose from "mongoose";
import { useTheme } from "@/components/ThemeContext";
import { FiMessageCircle, FiUsers, FiPlus } from "react-icons/fi";

export interface PopulatedConversation extends mongoose.Document {
  _id: string;
  type: "direct" | "group" | "project";
  participants: IUser[];
  name?: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationListProps {
  conversations: PopulatedConversation[];
  onSelectConversation: (conversation: PopulatedConversation) => void;
  selectedConversationId: string | null;
  onNewChatClick: () => void;
  onNewGroupClick: () => void;
  loadingConversations: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  selectedConversationId,
  onNewChatClick,
  onNewGroupClick,
  loadingConversations,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const getConversationName = (conversation: PopulatedConversation) => {
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find(
        (p) => String(p._id) !== user?._id
      );
      return otherParticipant
        ? `${otherParticipant.firstName || ""} ${
            otherParticipant.lastName || ""
          }`.trim() || otherParticipant.email
        : "Unknown User";
    }
    return conversation.name || "Group Chat";
  };

  const getConversationAvatar = (conversation: PopulatedConversation) => {
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find(
        (p) => String(p._id) !== user?._id
      );
      if (otherParticipant?.profileImage?.data) {
        return (
          <img
            src={otherParticipant.profileImage.data}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
        );
      }
      return (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-500'}`}>
          {(otherParticipant?.firstName?.[0] || otherParticipant?.email?.[0] || "U").toUpperCase()}
        </div>
      );
    }
    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'}`}>
        <FiUsers className="w-6 h-6" />
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-2xl shadow-lg border ${theme === "light" ? "border-gray-200" : "border-gray-700"} overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}>
            <FiMessageCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
            Messages
          </h2>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNewChatClick}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 group ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
          <button
            onClick={onNewGroupClick}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 group ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
          >
            <FiUsers className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="hidden sm:inline">New Group</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-sm font-medium">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 px-6">
            <FiMessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center text-sm font-medium">No conversations yet</p>
            <p className="text-center text-xs mt-1 opacity-75">Start a new chat to begin messaging</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {conversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation._id.toString();
              return (
                <div
                  key={conversation._id.toString()}
                  onClick={() => onSelectConversation(conversation)}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? `${theme === 'dark' ? 'bg-blue-900/30 border-blue-500/50' : 'bg-blue-50 border-blue-200'} border-2 shadow-md`
                      : `hover:${theme === "light" ? "bg-gray-50" : "bg-gray-700"} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {getConversationAvatar(conversation)}
                      {/* Online indicator placeholder */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold truncate ${theme === "light" ? "text-gray-900" : "text-white"} ${isSelected ? "text-blue-600" : ""}`}>
                          {getConversationName(conversation)}
                        </h4>
                        <span className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${theme === "light" ? "text-gray-600" : "text-gray-300"} ${isSelected ? "text-blue-500" : ""}`}>
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>

                    {/* Unread indicator placeholder */}
                    <div className="w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;

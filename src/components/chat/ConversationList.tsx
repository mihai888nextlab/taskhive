import { IUser } from "@/db/models/userModel";
import { useAuth } from "@/hooks/useAuth";
import mongoose from "mongoose";
import { useTheme } from "@/components/ThemeContext";

export interface PopulatedConversation extends mongoose.Document {
  _id: string; // Assuming _id can be a string or number
  type: "direct" | "group" | "project";
  participants: IUser[];
  name?: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationListProps {
  conversations: PopulatedConversation[]; // Conversations with populated participants
  onSelectConversation: (conversation: PopulatedConversation) => void;
  selectedConversationId: string | null;
  onNewChatClick: () => void; // For opening NewDirectChatModal
  onNewGroupClick: () => void; // For opening NewGroupChatModal
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
  const { user } = useAuth(); // Current logged-in user
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
    return conversation.name || "Nameless Conversation";
  };

  return (
    <div
      className={`flex flex-col h-full bg-${
        theme === "light" ? "white" : "gray-800"
      } border-r border-gray-200 rounded-l-lg shadow-md`}
    >
      <div
        className={`p-4 border-b bg-${
          theme === "light" ? "white" : "gray-700"
        }`}
      >
        <h2
          className={`text-xl font-bold text-${
            theme === "light" ? "gray-800" : "white"
          }`}
        >
          Conversații
        </h2>
        <div className="mt-4 space-y-2">
          <button
            onClick={onNewChatClick}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Chat
          </button>
          <button
            onClick={onNewGroupClick}
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 7.5c.04-.263.07-.527.07-.75a4.5 4.5 0 00-8.903-1.004c.009.07.017.14.026.21A4.5 4.5 0 0010 17a4.5 4.5 0 004.5-4.5c0-.17-.009-.34-.026-.51zm0 0a.75.75 0 00-.02-.21c-.02-.07-.04-.14-.06-.21M16.5 13a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM19.5 13a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
            </svg>
            New Group
          </button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto custom-scrollbar p-2 bg-${
          theme === "light" ? "white" : "gray-800"
        }`}
      >
        {loadingConversations ? (
          <div className="text-center text-gray-500 mt-4">
            Se încarcă conversațiile...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            Începe o conversație nouă!
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={(conversation._id as string)?.toString()}
              onClick={() => onSelectConversation(conversation)}
              className={`p-3 my-1 rounded-md cursor-pointer transition-colors duration-150 ${
                selectedConversationId ===
                (conversation._id as string).toString()
                  ? "bg-blue-800 border-l-4 border-blue-500"
                  : `hover:bg-${theme === "light" ? "gray-100" : "gray-600"}`
              } text-${theme === "light" ? "gray-800" : "white"}`}
            >
              <h4
                className={`font-semibold ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}
              >
                {getConversationName(conversation)}
              </h4>
              {/* Optional: Display last message snippet */}
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                } truncate`}
              >
                {conversation.lastMessage || "No messages yet"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;

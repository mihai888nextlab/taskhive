// components/chat/NewDirectChatModal.tsx
import React, { useState, useEffect } from "react";
import { FaTimes, FaComments, FaSearch, FaSpinner, FaUser } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { createPortal } from 'react-dom';

interface NewDirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (conversationId: string) => void;
}

interface GetUsersResponse {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  companyId: string;
  role: string;
  permissions: string[];
}

const NewDirectChatModal: React.FC<NewDirectChatModalProps> = ({
  isOpen,
  onClose,
  onChatCreated,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<GetUsersResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<GetUsersResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError(null);
      try {
        const res = await fetch("/api/get-users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        const users = data.users.filter(
          (u: GetUsersResponse) => (u.userId._id as string) !== user._id
        );
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Could not load users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(
        allUsers.filter(
          (u) =>
            u.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.userId.firstName &&
              u.userId.firstName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (u.userId.lastName &&
              u.userId.lastName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, allUsers]);

  const handleStartChat = async (targetUserId: string) => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    setCreatingChat(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "direct",
          participants: [user._id, targetUserId],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create chat");
      }

      const data = await res.json();
      onChatCreated(data.conversationId);
      
      // Reset and close
      setSearchTerm("");
      setError(null);
      onClose();
    } catch (err) {
      console.error("Error creating direct chat:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error creating direct chat.";
      setError(errorMessage);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-0 max-w-xl w-full mx-4 max-h-[90vh] relative animate-fadeIn overflow-hidden">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <FaComments className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Start Direct Chat</h2>
                  <p className="text-gray-600">Choose a team member to chat with</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-gray-900 text-lg font-semibold mb-3">
                  Find Team Member
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={creatingChat}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Users List */}
              {loadingUsers ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Loading team members...</p>
                </div>
              ) : filteredUsers.length === 0 && searchTerm === "" ? (
                <div className="text-center py-12">
                  <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Team Members</h4>
                  <p className="text-gray-500">No other users are available for chat</p>
                </div>
              ) : filteredUsers.length === 0 && searchTerm !== "" ? (
                <div className="text-center py-12">
                  <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h4>
                  <p className="text-gray-500">Try searching with a different name or email</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Available Team Members ({filteredUsers.length})
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredUsers.map((u) => (
                      <div
                        key={u._id as string}
                        className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {u.userId.firstName?.[0]}{u.userId.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              {u.userId.firstName} {u.userId.lastName}
                            </p>
                            <p className="text-gray-600">{u.userId.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartChat(u.userId._id as string)}
                          disabled={creatingChat}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            creatingChat
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-800 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {creatingChat ? (
                            <div className="flex items-center gap-2">
                              <FaSpinner className="animate-spin" />
                              Starting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FaComments />
                              Start Chat
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClose}
                className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
                disabled={creatingChat}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default NewDirectChatModal;

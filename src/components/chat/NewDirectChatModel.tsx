// components/chat/NewDirectChatModal.tsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { useAuth } from "@/pages/_app"; // Custom hook to get current user

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
  const { user } = useAuth(); // Current user
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
        const res = await fetch("/api/get-users"); // API to get all users
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        // Filter out the current user
        const users = data.users.filter(
          (u: GetUsersResponse) => (u.userId._id as string) !== user._id
        );
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Nu s-au putut încărca utilizatorii.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, user]);

  // Filter users based on search term
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
      setError("Utilizatorul nu este autentificat.");
      return;
    }
    setCreatingChat(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        // API to create direct conversation
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
      onChatCreated(data.conversationId); // Pass new conversation ID back to parent
      onClose(); // Close modal
    } catch (err) {
      console.error("Error creating direct chat:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Eroare la crearea conversației directe.";
      setError(errorMessage);
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouă Conversație Directă">
      <div className="p-4">
        <input
          type="text"
          placeholder="Căută utilizatori după nume sau email..."
          className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {loadingUsers ? (
          <p className="text-gray-500 text-center">
            Se încarcă utilizatorii...
          </p>
        ) : filteredUsers.length === 0 && searchTerm === "" ? (
          <p className="text-gray-500 text-center">
            Nu sunt alți utilizatori disponibili.
          </p>
        ) : filteredUsers.length === 0 && searchTerm !== "" ? (
          <p className="text-gray-500 text-center">Niciun utilizator găsit.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredUsers.map((u) => (
              <div
                key={u._id as string}
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150"
              >
                <div>
                  <p className="font-semibold">
                    {u.userId.firstName} {u.userId.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{u.userId.email}</p>
                </div>
                <button
                  onClick={() => handleStartChat(u.userId._id as string)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
                  disabled={creatingChat}
                >
                  {creatingChat ? "Se creează..." : "Start Chat"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NewDirectChatModal;

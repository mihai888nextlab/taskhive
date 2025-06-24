// components/chat/NewGroupChatModal.tsx
import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useAuth } from "@/hooks/useAuth"; // Custom hook to get current user

interface NewGroupChatModalProps {
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

const NewGroupChatModal: React.FC<NewGroupChatModalProps> = ({
  isOpen,
  onClose,
  onChatCreated,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<GetUsersResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<GetUsersResponse[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<GetUsersResponse[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users (excluding current user)
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

  const toggleUserSelection = (userToToggle: GetUsersResponse) => {
    setSelectedUsers((prev) =>
      prev.find(
        (u) => (u.userId._id as string) === (userToToggle.userId._id as string)
      )
        ? prev.filter(
            (u) =>
              (u.userId._id as string) !== (userToToggle.userId._id as string)
          )
        : [...prev, userToToggle]
    );
  };

  const handleCreateGroup = async () => {
    if (!user) {
      setError("Utilizatorul nu este autentificat.");
      return;
    }
    if (selectedUsers.length < 1) {
      // At least 2 participants besides self (so 1 selected user)
      setError("Selectează cel puțin un utilizator pentru a crea un grup.");
      return;
    }
    if (!groupName.trim()) {
      setError("Numele grupului nu poate fi gol.");
      return;
    }

    setCreatingGroup(true);
    setError(null);

    try {
      const participantIds = [
        user._id,
        ...selectedUsers.map((u) => u.userId._id as string),
      ];

      const res = await fetch("/api/conversations", {
        // API to create group conversation
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "group",
          name: groupName.trim(),
          participants: participantIds,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create group");
      }

      const data = await res.json();
      onChatCreated(data.conversationId);
      onClose(); // Close modal
    } catch (err) {
      console.error("Error creating group chat:", err);
      setError(
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message ||
              "Eroare la crearea grupului."
          : "Eroare la crearea grupului."
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Creează un Grup Nou">
      <div className="p-4">
        <div className="mb-4">
          <label
            htmlFor="groupName"
            className="block text-sm font-medium text-gray-700"
          >
            Nume Grup
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Introduceți numele grupului"
            className="w-full p-2 border rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input
          type="text"
          placeholder="Căută utilizatori de adăugat..."
          className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">
            Utilizatori selectați:
          </h4>
          {selectedUsers.length === 0 ? (
            <p className="text-sm text-gray-500">Niciun utilizator selectat.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span
                  key={u._id as string}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {u.userId.firstName} {u.userId.lastName || u.userId.email}
                  <button
                    onClick={() => toggleUserSelection(u)}
                    className="ml-2 text-blue-600 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {loadingUsers ? (
          <p className="text-gray-500 text-center">
            Se încarcă utilizatorii...
          </p>
        ) : filteredUsers.length === 0 && searchTerm === "" ? (
          <p className="text-gray-500 text-center">
            Niciun utilizator de adăugat.
          </p>
        ) : filteredUsers.length === 0 && searchTerm !== "" ? (
          <p className="text-gray-500 text-center">Niciun utilizator găsit.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredUsers.map((u) => {
              const isSelected = selectedUsers.some(
                (su) => (su._id as string) === (u._id as string)
              );
              return (
                <div
                  key={u._id as string}
                  className={`flex items-center justify-between p-2 my-1 rounded-md cursor-pointer transition-colors duration-150 ${
                    isSelected ? "bg-blue-50" : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleUserSelection(u)}
                >
                  <div>
                    <p className="font-semibold">
                      {u.userId.firstName} {u.userId.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{u.userId.email}</p>
                  </div>
                  {isSelected ? (
                    <span className="text-green-500">Selectat</span>
                  ) : (
                    <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-300">
                      Adaugă
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <button
          onClick={handleCreateGroup}
          className="w-full bg-green-500 text-white py-2 rounded-md mt-4 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            creatingGroup || selectedUsers.length < 1 || !groupName.trim()
          }
        >
          {creatingGroup ? "Se creează grupul..." : "Creează Grup"}
        </button>
      </div>
    </Modal>
  );
};

export default NewGroupChatModal;

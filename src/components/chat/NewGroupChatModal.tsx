// components/chat/NewGroupChatModal.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaTimes, FaUsers, FaPlus, FaSearch, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { createPortal } from 'react-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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

const NewGroupChatModal: React.FC<NewGroupChatModalProps> = React.memo(({
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
  const t = useTranslations("CommunicationPage");

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
        setError("Could not load users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, user]);

  // Memoize filteredUsers
  const memoFilteredUsers = useMemo(() => {
    if (searchTerm.trim() === "") return allUsers;
    return allUsers.filter(
      (u) =>
        u.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.userId.firstName &&
          u.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.userId.lastName &&
          u.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allUsers]);

  // Memoize toggleUserSelection
  const toggleUserSelection = useCallback((userToToggle: GetUsersResponse) => {
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
  }, []);

  // Memoize handleCreateGroup
  const handleCreateGroup = useCallback(async () => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    if (selectedUsers.length < 1) {
      setError("Select at least one user to create a group.");
      return;
    }
    if (!groupName.trim()) {
      setError("Group name cannot be empty.");
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
      
      // Reset form
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
      onClose();
    } catch (err) {
      console.error("Error creating group chat:", err);
      setError(
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message || "Error creating group."
          : "Error creating group."
      );
    } finally {
      setCreatingGroup(false);
    }
  }, [user, selectedUsers, groupName, onChatCreated, onClose]);

  // Memoize handleClose
  const handleClose = useCallback(() => {
    setGroupName("");
    setSelectedUsers([]);
    setSearchTerm("");
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-[90vw] max-w-6xl h-[85vh] relative animate-fadeIn overflow-hidden flex">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            {/* Left Column - Group Details & Selected Users */}
            <div className="w-2/5 bg-blue-50 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <FaUsers className="text-xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t("createNewGroup")}</h2>
                    <p className="text-gray-600">{t("setUpTeamCollab")}</p>
                  </div>
                </div>
              </div>

              {/* Group Name Input */}
              <div className="p-6 border-b border-gray-200">
                <label htmlFor="groupName" className="block text-gray-900 text-lg font-semibold mb-3">
                  {t("groupName")} *
                </label>
                <Input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={t("groupNamePlaceholder")}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-lg"
                  disabled={creatingGroup}
                />
              </div>

              {/* Selected Users */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  {t("selectedMembers", { count: selectedUsers.length })}
                </h4>
                
                {selectedUsers.length === 0 ? (
                  <div className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl text-center">
                    <FaUsers className="text-4xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">{t("noMembersSelected")}</p>
                    <p className="text-gray-400 text-sm">{t("chooseMembersRightPanel")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUsers.map((u) => (
                      <div
                        key={u._id as string}
                        className="bg-white border border-blue-200 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {u.userId.firstName?.[0]}{u.userId.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {u.userId.firstName} {u.userId.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{u.userId.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleUserSelection(u)}
                          className="text-red-500 hover:text-red-700 text-xl font-bold p-1"
                          disabled={creatingGroup}
                          title="Remove from group"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-6 border-t border-gray-200">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex gap-4">
                  <Button
                    onClick={handleClose}
                    className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
                    disabled={creatingGroup}
                    variant="ghost"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={creatingGroup || selectedUsers.length < 1 || !groupName.trim()}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      creatingGroup || selectedUsers.length < 1 || !groupName.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-800'
                    }`}
                  >
                    {creatingGroup ? (
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        {t("creating")}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <FaUsers />
                        {t("createGroup")}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Search & User List */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Search Header */}
              <div className="p-6 border-b border-gray-200">
                <label className="block text-gray-900 text-lg font-semibold mb-3">
                  {t("addTeamMembers")}
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t("searchUsersPlaceholder")}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={creatingGroup}
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-4">{t("availableTeamMembers")}</h4>
                
                {loadingUsers ? (
                  <div className="text-center py-12">
                    <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">{t("loadingTeamMembers")}</p>
                  </div>
                ) : memoFilteredUsers.length === 0 && searchTerm === "" ? (
                  <div className="text-center py-12">
                    <FaUsers className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("noTeamMembers")}</h4>
                    <p className="text-gray-500">{t("noOtherUsersAvailable")}</p>
                  </div>
                ) : memoFilteredUsers.length === 0 && searchTerm !== "" ? (
                  <div className="text-center py-12">
                    <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("noResultsFound")}</h4>
                    <p className="text-gray-500">{t("tryDifferentSearch")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memoFilteredUsers.map((u) => {
                      const isSelected = selectedUsers.some(
                        (su) => (su._id as string) === (u._id as string)
                      );
                      return (
                        <div
                          key={u._id as string}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 border-2 ${
                            isSelected 
                              ? "bg-blue-50 border-blue-200" 
                              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-lg">
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
                          
                          {isSelected ? (
                            <div className="flex items-center gap-2 text-blue-600 font-medium">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                              </div>
                              {t("added")}
                            </div>
                          ) : (
                            <Button 
                              onClick={() => toggleUserSelection(u)}
                              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-800 font-medium transition-all duration-200 flex items-center gap-2"
                              disabled={creatingGroup}
                            >
                              <FaPlus className="text-sm" />
                              {t("add")}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default React.memo(NewGroupChatModal);
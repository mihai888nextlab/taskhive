import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { FaTimes, FaEnvelope, FaUser, FaUserTag } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { uniqBy } from "lodash";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: { data: string };
    description?: string;
    role: string;
    skills?: string[];
  } | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose, user }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState(user?.role || "");
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch available roles (unique, lowercase-insensitive)
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        if (!response.ok) return;
        const data = await response.json();
        const uniqueRoles = Array.from(
          new Set(data.map((r: { name: string }) => r.name.toLowerCase()))
        ).map(name =>
          data.find((r: { name: string }) => r.name.toLowerCase() === name)?.name || name
        );
        setRoles(uniqueRoles);
      } catch {}
    };
    fetchRoles();
  }, []);

  // Always sync selectedRole with user.role when modal opens or user changes
  useEffect(() => {
    setSelectedRole(user?.role || "");
  }, [user, open]);

  // Memoize role badge color
  const getRoleBadgeColor = useCallback((role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "manager":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "user":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }, []);

  // Memoize initials
  const getInitials = useCallback(() => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    return (firstName[0] || "") + (lastName[0] || "");
  }, [user]);

  const handleSendMessage = useCallback(() => {
    if (user) {
      router.push(`/app/communication?userId=${user._id}`);
      onClose();
    }
  }, [router, user, onClose]);

  const handleRoleBadgeClick = useCallback(() => {
    if (currentUser?.role === "admin") {
      setRoleDropdownOpen((v) => !v);
    }
  }, [currentUser]);

  // Determine if the current user can change roles
  const canChangeRole = currentUser?.role === "admin";

  const handleRoleChange = useCallback(async (newRole: string) => {
    setRoleLoading(true);
    try {
      const res = await fetch("/api/update-user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id, role: newRole }),
      });
      if (res.ok) {
        setSelectedRole(newRole);
        if (user) user.role = newRole;
      }
      setRoleDropdownOpen(false);
    } catch (error) {
      // Handle error
    } finally {
      setRoleLoading(false);
    }
  }, [user]);

  // Memoize skills rendering
  const skillsList = useMemo(() => (
    user?.skills && user.skills.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {user.skills.map((skill, index) => (
          <span
            key={index}
            className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
          >
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">No skills listed.</p>
    )
  ), [user]);

  // When modal closes, refresh page if role was changed
  useEffect(() => {
    if (!open && selectedRole !== (user?.role || "")) {
      router.reload();
    }
    // Only run when modal closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !user) return null;

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fadeIn overflow-hidden">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center gap-4">
                {/* Avatar using shadcn/ui */}
                <div className="flex-shrink-0">
                  <Avatar className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-blue-500 text-white font-bold text-xl flex items-center justify-center">
                    {user.profileImage?.data ? (
                      <AvatarImage
                        src={user.profileImage.data}
                        alt="Profile"
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback>
                        {getInitials() || <FaUser className="w-6 h-6" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex items-center gap-3 mb-2 relative">
                    {/* Role badge with dropdown arrow and click handler */}
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-150 focus:outline-none ${
                        getRoleBadgeColor(selectedRole)
                      } ${canChangeRole ? "cursor-pointer hover:bg-blue-100" : ""}`}
                      onClick={canChangeRole ? handleRoleBadgeClick : undefined}
                      aria-haspopup={canChangeRole}
                      aria-expanded={roleDropdownOpen}
                      tabIndex={0}
                    >
                      <FaUserTag className="w-3 h-3" />
                      {selectedRole}
                      {canChangeRole && (
                        <FiChevronDown className={`ml-1 w-4 h-4 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
                      )}
                    </button>
                    {/* Dropdown */}
                    {canChangeRole && roleDropdownOpen && (
                      <div className="absolute left-0 top-full mt-2 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                        {roles.map((role) => (
                          <button
                            key={role}
                            className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center ${
                              role === selectedRole ? "font-bold bg-blue-100" : ""
                            }`}
                            onClick={() => handleRoleChange(role)}
                            disabled={roleLoading || role === selectedRole}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="w-4 h-4" />
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {user.email}
                    </a>
                  </div>
                </div>

                {/* Send Message Button */}
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                >
                  <FaEnvelope className="w-4 h-4" />
                  Send Message
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* About Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {user.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {skillsList}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default React.memo(UserProfileModal);
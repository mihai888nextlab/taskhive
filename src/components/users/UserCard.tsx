import React from "react";
import { FaUser, FaEnvelope, FaUserTag } from "react-icons/fa";

interface User {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: {
      data: string;
      contentType: string;
      uploadedAt: string;
      fileName?: string;
    };
    description?: string;
    skills?: string[];
  };
  companyId: string;
  role: string;
  permissions: string[];
}

interface UserCardProps {
  user: User;
  theme: string;
  onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, theme, onClick }) => {
  const getRoleBadgeColor = (role: string) => {
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
  };

  const getInitials = () => {
    const firstName = user.userId.firstName || "";
    const lastName = user.userId.lastName || "";
    return (firstName[0] || "") + (lastName[0] || "");
  };

  return (
    <div
      className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer group ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
          : "bg-white border-gray-200 hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.userId.profileImage?.data ? (
            <img
              src={user.userId.profileImage.data}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
              }`}
            >
              {getInitials() || <FaUser className="w-5 h-5" />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and Role */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-base leading-tight ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {user.userId.firstName} {user.userId.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  <FaUserTag className="w-3 h-3" />
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 mb-3">
            <FaEnvelope
              className={`w-3 h-3 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span
              className={`text-sm truncate ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {user.userId.email}
            </span>
          </div>

          {/* Skills Preview */}
          {user.userId.skills && user.userId.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user.userId.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {skill}
                </span>
              ))}
              {user.userId.skills.length > 3 && (
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  +{user.userId.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div
        className={`absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-all duration-200 pointer-events-none`}
      />
    </div>
  );
};

export default UserCard;
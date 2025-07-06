import React from "react";
import { FaUser, FaEnvelope, FaUserTag } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

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

  const initials = getInitials();

  return (
    <Card
      className={`relative p-6 rounded-2xl border border-[#e5e7eb] transition-all duration-150 cursor-pointer group bg-white`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            {user.userId.profileImage?.data ? (
              <AvatarImage
                src={user.userId.profileImage.data}
                alt="Profile"
                className="object-cover"
              />
            ) : (
              <AvatarFallback>
                {getInitials() || <FaUser className="w-5 h-5" />}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Role */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight text-gray-900">
                  {user.userId.firstName} {user.userId.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    <FaUserTag className="w-3 h-3" />
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 mb-3">
              <FaEnvelope className="w-3 h-3 text-gray-500" />
              <span className="text-sm truncate text-gray-700">
                {user.userId.email}
              </span>
            </div>

            {/* Skills Preview */}
            {user.userId.skills && user.userId.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.userId.skills.slice(0, 3).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                  >
                    {skill}
                  </Badge>
                ))}
                {user.userId.skills.length > 3 && (
                  <Badge
                    variant="outline"
                    className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"
                  >
                    +{user.userId.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Hover indicator */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500 transition-all duration-200 pointer-events-none"
        />
      </CardContent>
    </Card>
  );
};

export default UserCard;
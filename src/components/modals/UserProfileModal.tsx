import React from "react";
import { useRouter } from "next/router";
import { FaTimes, FaEnvelope, FaUser, FaUserTag } from "react-icons/fa";
import { createPortal } from 'react-dom';

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
  
  if (!open || !user) return null;

  const handleSendMessage = () => {
    router.push(`/app/communication?userId=${user._id}`);
    onClose();
  };

  const getInitials = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return (firstName[0] || "") + (lastName[0] || "");
  };

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

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fadeIn overflow-hidden">
            {/* Close Button */}
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
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.profileImage?.data ? (
                    <img
                      src={user.profileImage.data}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {getInitials() || <FaUser className="w-6 h-6" />}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                      <FaUserTag className="w-3 h-3" />
                      {user.role}
                    </span>
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
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                >
                  <FaEnvelope className="w-4 h-4" />
                  Send Message
                </button>
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
                  {user.skills && user.skills.length > 0 ? (
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
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserProfileModal;
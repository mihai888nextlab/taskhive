import React from "react";
import { useRouter } from "next/router";

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
    skills?: string[]; // Added skills field
  } | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose, user }) => {
  const router = useRouter();
  if (!open || !user) return null;

  const handleSendMessage = () => {
    router.push(`/app/communication?userId=${user._id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl"
        >
          &times;
        </button>
        <div className="flex flex-col gap-6">
          {/* Top section: image and info */}
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              {user.profileImage?.data ? (
                <img
                  src={user.profileImage.data}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-gray-400">
                  {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 w-full h-32">
              <div className="flex flex-col flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm capitalize">
                    {user.role}
                  </span>
                  <span className="text-gray-500 dark:text-gray-300 text-sm">
                    <a
                      href={`mailto:${user.email}`}
                      className="text-white underline hover:text-blue-300"
                    >
                      {user.email}
                    </a>
                  </span>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow transition text-sm flex items-center self-start md:self-center"
              >
                <svg
                  className="inline-block mr-1 -mt-0.5"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Send message
              </button>
            </div>
          </div>
          {/* About section below */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-line">
              {user.description || "No description provided."}
            </p>
            <div className="mt-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Skills</h4>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-sm">No skills provided.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
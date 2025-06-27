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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ">
      <div className="relative bg-gradient-to-br from-white/90 via-background/60 to-white/70 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full p-0 border border-accent/30 overflow-hidden">
        {/* Premium accent bar */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-20 h-2 rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 blur-sm opacity-80 z-10" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl z-20"
        >
          &times;
        </button>
        <div className="p-12 pt-10 flex flex-col gap-10 relative z-10">
          {/* Top section: image and info */}
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary/10 via-white/60 to-primary/5 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 overflow-hidden flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
              {user.profileImage?.data ? (
                <img
                  src={user.profileImage.data}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-primary/60 dark:text-primary/40">
                  {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full h-36">
              <div className="flex flex-col flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 mb-2">
                  <span className="text-primary font-semibold text-base capitalize bg-primary/10 px-3 py-1 rounded-full">
                    {user.role}
                  </span>
                  <span className="text-gray-500 dark:text-gray-300 text-sm">
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-700 underline hover:text-blue-400 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {user.email}
                    </a>
                  </span>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                className="px-6 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white rounded-full font-semibold shadow-md transition text-base flex items-center self-start md:self-center mt-2 md:mt-0"
              >
                <svg
                  className="inline-block mr-2 -mt-0.5"
                  width="18"
                  height="18"
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
          <div className="bg-white/60 dark:bg-gray-900/60 rounded-2xl p-8 shadow-inner border border-accent/10">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-line text-base">
              {user.description || "No description provided."}
            </p>
            <div className="mt-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 text-base">Skills</h4>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-gradient-to-r from-primary/10 to-secondary/10 text-secondary font-medium px-4 py-1.5 rounded-full text-sm shadow-sm border border-primary/10"
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
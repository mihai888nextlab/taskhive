import React from "react";

interface UserCardProps {
  user: any;
  theme: string;
  onClick: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, theme, onClick }) => (
  <button
    key={user._id}
    className={`bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 flex flex-col space-y-3 cursor-pointer text-left transition hover:ring-2 hover:ring-primary/40 border border-gray-200/60 backdrop-blur-lg`}
    onClick={() => onClick(user.userId._id)}
    type="button"
    style={{ minWidth: 260 }}
  >
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">First Name</span>
      <span className="text-lg font-bold text-gray-900 dark:text-white">{user.userId.firstName}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">Last Name</span>
      <span className="text-lg font-bold text-gray-900 dark:text-white">{user.userId.lastName}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">Email</span>
      <span className="text-base text-gray-700 dark:text-gray-200 break-all">{user.userId.email}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">Role</span>
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
          user.role === "admin"
            ? "bg-red-100 text-red-800"
            : user.role === "user"
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {user.role}
      </span>
    </div>
  </button>
);

export default UserCard;
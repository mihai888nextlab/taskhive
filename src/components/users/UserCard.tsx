import React from "react";

interface UserCardProps {
  user: any;
  theme: string;
  onClick: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, theme, onClick }) => (
  <button
    key={user._id}
    className={`w-full bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col space-y-3 cursor-pointer text-left transition hover:ring-2 hover:ring-primary/40 border border-gray-200/60 backdrop-blur-lg`}
    onClick={() => onClick(user.userId._id)}
    type="button"
    style={{ minWidth: 0 }}
  >
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 font-semibold">First Name</span>
      <span className="text-lg font-bold text-gray-900">{user.userId.firstName}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 font-semibold">Last Name</span>
      <span className="text-lg font-bold text-gray-900">{user.userId.lastName}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 font-semibold">Email</span>
      <span className="text-base text-gray-900 break-all">{user.userId.email}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 font-semibold">Role</span>
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
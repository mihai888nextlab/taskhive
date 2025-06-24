import React from "react";

interface UserCardProps {
  user: any;
  theme: string;
  onClick: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, theme, onClick }) => (
  <button
    key={user._id}
    className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} rounded-xl shadow-md p-4 flex flex-col space-y-2 cursor-pointer text-left transition hover:ring-2 hover:ring-blue-400`}
    onClick={() => onClick(user.userId._id)}
    type="button"
  >
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">First Name</span>
      <span className="text-lg font-bold text-gray-100">{user.userId.firstName}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">Last Name</span>
      <span className="text-lg font-bold text-gray-100">{user.userId.lastName}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">Email</span>
      <span className="text-base text-gray-200 break-all">{user.userId.email}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-semibold">Role</span>
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          user.role === "admin"
            ? "bg-red-600 text-white"
            : user.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-600 text-white"
        }`}
      >
        {user.role}
      </span>
    </div>
  </button>
);

export default UserCard;
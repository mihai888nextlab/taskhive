import React from "react";
import FloatingLabelInput from "../FloatingLabelInput";
import { IoMdCloseCircle } from "react-icons/io";

export default function AddUsersModal({
  onClose,
  onUserAdded,
}: {
  onClose: () => void;
  onUserAdded: (
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    role: string
  ) => Promise<string | undefined>;
}) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    console.log("Form submitted:", {
      email,
      firstName,
      lastName,
      password,
      role,
    });

    if (!email || !firstName || !lastName || !password || !role) {
      setError("All fields are required.");
      return;
    }

    let data = await onUserAdded(email, firstName, lastName, password, role);

    if (data) {
      setError(data);
      return;
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold w-56">Add User</h2>
          <button
            className="text-red-500 hover:text-red-700 cursor-pointer"
            onClick={() => {
              onClose();
            }}
          >
            <IoMdCloseCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-3">
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label> */}
            {/* <input
              type="email"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user email"
            /> */}
            <FloatingLabelInput
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              theme="light"
            />
            <FloatingLabelInput
              id="lastName"
              name="lastName"
              label="Last Name"
              type="text"
              theme="light"
            />
            <FloatingLabelInput
              id="email"
              name="email"
              label="Email"
              type="email"
              theme="light"
            />
            <FloatingLabelInput
              id="password"
              name="password"
              label="Password"
              type="password"
              theme="light"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="role"
            >
              <option value="" disabled selected>
                --- Select role ---
              </option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4 w-full text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition duration-200"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";

interface AddRoleModalProps {
  onClose: () => void;
  onRoleAdded: (roleName: string) => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onRoleAdded }) => {
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleName.trim()) {
      setLoading(true);
      try {
        const response = await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: roleName }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            // Role already exists, ignore or show a message
            // Optionally: return here or continue
            // Example: just return silently
            return;
            // Or show a toast: toast.info("Role already exists");
          } else {
            throw new Error("Failed to add role");
          }
        }

        onRoleAdded(roleName.trim());
        setRoleName("");
        onClose();
      } catch (error) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-200/60 w-96 max-w-full relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center w-full">Add Role</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-all text-2xl"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roleName" className="block text-gray-700 text-sm font-semibold mb-2">Role Name:</label>
            <input
              type="text"
              id="roleName"
              placeholder="Role Name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300"
              disabled={loading}
            >
              {loading && <FaSpinner className="animate-spin mr-3 text-xl" />}
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;
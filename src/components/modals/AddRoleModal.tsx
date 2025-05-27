import React, { useState } from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";

interface AddRoleModalProps {
  onClose: () => void;
  onRoleAdded: (roleName: string) => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onRoleAdded }) => {
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleName.trim()) {
      setLoading(true);
      onRoleAdded(roleName.trim());
      setRoleName("");
      onClose();
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center">Add Role</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-all text-2xl"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
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
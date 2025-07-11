import React, { useState } from "react";
import { FaSpinner, FaTimes, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface AddRoleModalProps {
  onClose: () => void;
  onRoleAdded: (roleName: string) => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onRoleAdded }) => {
  const t = useTranslations("AddRoleModal");
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

        if (!response.ok && response.status !== 409) {
          throw new Error(t("addRole"));
        }

        onRoleAdded(roleName.trim());
        setRoleName("");
        onClose();
      } catch (error) {
        console.error("Error adding role:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative animate-fadeIn overflow-hidden">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
          onClick={onClose}
          aria-label={t("cancel")}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-xl shadow-lg">
              <FaPlus className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("addNewRole")}</h2>
              <p className="text-gray-600">{t("createNewRole")}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className="block text-gray-900 font-semibold mb-2 text-sm">
              {t("roleName")}
            </label>
            <Input
              type="text"
              placeholder={t("roleNamePlaceholder")}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("enterRoleName")}
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200 text-sm"
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !roleName.trim()}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                loading || !roleName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin w-3 h-3" />
                  {t("creating")}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaPlus className="w-3 h-3" />
                  {t("addRole")}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;
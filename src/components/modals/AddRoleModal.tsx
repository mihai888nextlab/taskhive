import React, { useState, useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
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
  const { theme } = useTheme();
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoize input handler
  const handleRoleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleName(e.target.value);
  }, []);

  // Memoize close handler
  const handleFormClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoize submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [roleName, t, onRoleAdded, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className={`rounded-3xl shadow-2xl w-full max-w-md relative animate-fadeIn overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white'}`}>
        {/* Close Button */}
        <button
          className={`absolute top-4 right-4 text-xl font-bold z-10 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          onClick={onClose}
          aria-label={t("cancel")}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className={`p-6 border-b flex items-center gap-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-green-50'}`}>
          <div className="p-3 bg-green-600 rounded-xl shadow-lg">
            <FaPlus className="text-xl text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("addNewRole")}</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t("createNewRole")}</p>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("roleName")}</label>
            <Input
              type="text"
              placeholder={t("roleNamePlaceholder")}
              value={roleName}
              onChange={handleRoleNameChange}
              className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'border border-gray-300'}`}
              required
              disabled={loading}
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t("enterRoleName")}</p>
          </div>
        </form>

        {/* Footer */}
        <div className={`p-6 border-t flex gap-3 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleFormClose}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
                ? theme === 'dark'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-green-700 text-white hover:bg-green-800 shadow-sm hover:shadow-md'
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
  );
};

export default React.memo(AddRoleModal);
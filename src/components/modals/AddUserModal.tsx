import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/components/ThemeContext";
import { FaSpinner, FaTimes, FaUserPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface AddUserModalProps {
  onClose: () => void;
  onUserAdded: (email: string, role: string) => Promise<string | undefined>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  onClose,
  onUserAdded,
}) => {
  const t = useTranslations("AddUserModal");
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        if (!response.ok) throw new Error(t("errorFetchingRoles"));
        const data = await response.json();
        const uniqueRoles = data
          .map((role: { name: string }) => role.name)
          .filter(
            (role: string, index: number, arr: string[]) =>
              arr.findIndex((r) => r.toLowerCase() === role.toLowerCase()) ===
              index
          )
          .sort();
        setRoles(uniqueRoles);
      } catch (error) {
        setError(t("errorFetchingRoles"));
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, [t]);

  // Memoize roles list
  const memoRoles = useMemo(() => roles, [roles]);

  // Memoize input handlers
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );
  const handleRoleChange = useCallback((v: string) => {
    setRole(v);
  }, []);
  const handleFormClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoize submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !role) {
        setError(t("allFieldsRequired"));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await onUserAdded(email, role);
        if (result) {
          setError(result);
        } else {
          onClose();
        }
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : t("errorFetchingRoles")
        );
      } finally {
        setLoading(false);
      }
    },
    [email, role, onUserAdded, onClose, t]
  );

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
        <div className={`p-6 border-b flex items-center gap-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-blue-50'}`}>
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <FaUserPlus className="text-xl text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("addNewUser")}</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t("inviteNewTeamMember")}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'}`}>
              <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("emailAddress")}</label>
              <Input
                type="email"
                placeholder="john.doe@company.com"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'border border-gray-300'}`}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("role")}</label>
              <Select
                value={role}
                onValueChange={handleRoleChange}
                disabled={loading}
                required
              >
                <SelectTrigger className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300'}`}>
                  <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent
                  className={`${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white border border-gray-300'} rounded-lg shadow-lg p-0 z-[250]`}
                  sideOffset={4}
                >
                  {memoRoles.map((roleName) => (
                    <SelectItem
                      key={roleName}
                      value={roleName}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${theme === 'dark' ? 'text-white bg-gray-900 hover:bg-blue-900 focus:bg-blue-800 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300' : 'text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700'}`}
                    >
                      {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

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
            disabled={loading || !email || !role}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
              loading || !email || !role
                ? theme === 'dark'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm hover:shadow-md'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin w-3 h-3" />
                {t("inviting")}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaUserPlus className="w-3 h-3" />
                {t("inviteUser")}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AddUserModal);

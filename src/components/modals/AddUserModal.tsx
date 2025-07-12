import React, { useState, useEffect } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <FaUserPlus className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("addNewUser")}
              </h2>
              <p className="text-gray-600">{t("inviteNewTeamMember")}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-900 font-semibold mb-2 text-sm">
                {t("emailAddress")}
              </label>
              <Input
                type="email"
                placeholder="john.doe@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-2 text-sm">
                {t("role")}
              </label>
              <Select
                value={role}
                onValueChange={setRole}
                disabled={loading}
                required
              >
                <SelectTrigger className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white">
                  <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent
                  className="bg-white border border-gray-300 rounded-lg shadow-lg p-0 z-[250]"
                  sideOffset={4}
                >
                  {roles.map((roleName) => (
                    <SelectItem
                      key={roleName}
                      value={roleName}
                      className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
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
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
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
    </div>
  );
};

export default AddUserModal;

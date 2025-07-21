import React, { useState, useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
import { FaSpinner, FaTimes, FaBuilding } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onCompanyAdded?: (company: any) => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  open,
  onClose,
  userId,
  onCompanyAdded,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [companyRegNr, setCompanyRegNr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations("DashboardPage");
  const { theme } = useTheme();

  // Memoize input handlers
  const handleCompanyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCompanyName(e.target.value);
    },
    []
  );
  const handleCompanyRegNrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCompanyRegNr(e.target.value);
    },
    []
  );
  const handleFormClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoize submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!companyName.trim()) {
        setError(
          t("companyNameRequired", { default: "Company name is required." })
        );
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/add-company", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            companyName: companyName.trim(),
            companyRegistrationNumber: companyRegNr.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(
            data.message ||
              t("failedToAddCompany", { default: "Failed to add company." })
          );
        } else {
          if (onCompanyAdded) onCompanyAdded(data.company); // <-- triggers reload in parent
          onClose();
        }
      } catch (err: any) {
        setError(
          t("unexpectedError", { default: "An unexpected error occurred." })
        );
      } finally {
        setLoading(false);
      }
    },
    [companyName, companyRegNr, userId, onCompanyAdded, onClose, t]
  );

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm p-4 ${theme === 'dark' ? 'bg-black/60' : 'bg-black/30'}`}
    >
      <div
        className={`rounded-3xl shadow-2xl w-full max-w-md relative animate-fadeIn overflow-hidden border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        {/* Close Button */}
        <button
          className={`absolute top-4 right-4 text-xl font-bold z-10 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          onClick={onClose}
          aria-label={t("cancel", { default: "Cancel" })}
        >
          <FaTimes />
        </button>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-blue-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'}`}>
              <FaBuilding className="text-xl text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t("addCompany", { default: "Add Company" })}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t("registerNewCompany", { default: "Register a new company" })}
              </p>
            </div>
          </div>
        </div>
        {/* Content */}
        <form onSubmit={handleSubmit} className={`p-6 space-y-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${theme === 'dark' ? 'bg-red-950 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}
          <div>
            <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t("companyName", { default: "Company Name" })} *
            </label>
            <Input
              type="text"
              placeholder={t("companyNamePlaceholder", {
                default: "e.g. Acme Inc.",
              })}
              value={companyName}
              onChange={handleCompanyNameChange}
              required
              disabled={loading}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'text-white bg-gray-900 border-gray-700 focus:ring-blue-800' : 'text-black bg-white border-gray-300 focus:ring-blue-500'}`}
            />
          </div>
          <div>
            <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t("registrationNumber", { default: "Registration Number" })}
            </label>
            <Input
              type="text"
              placeholder={t("registrationNumberPlaceholder", {
                default: "Optional",
              })}
              value={companyRegNr}
              onChange={handleCompanyRegNrChange}
              disabled={loading}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'text-white bg-gray-900 border-gray-700 focus:ring-blue-800' : 'text-black bg-white border-gray-300 focus:ring-blue-500'}`}
            />
          </div>
        </form>
        {/* Footer */}
        <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleFormClose}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              disabled={loading}
            >
              {t("cancel", { default: "Cancel" })}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !companyName.trim()}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                loading || !companyName.trim()
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm hover:shadow-md'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin w-3 h-3" />
                  {t("adding", { default: "Adding..." })}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaBuilding className="w-3 h-3" />
                  {t("addCompany", { default: "Add Company" })}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyModal;

import React, { useState, useCallback } from "react";
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md relative animate-fadeIn overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 text-xl font-bold z-10"
          onClick={onClose}
          aria-label={t("cancel", { default: "Cancel" })}
        >
          <FaTimes />
        </button>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <FaBuilding className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("addCompany", { default: "Add Company" })}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t("registerNewCompany", { default: "Register a new company" })}
              </p>
            </div>
          </div>
        </div>
        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-gray-900">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-sm">
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
              className="text-black dark:text-white w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-800 transition-all duration-200 text-sm bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-sm">
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
              className="text-black dark:text-white w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-800 transition-all duration-200 text-sm bg-white dark:bg-gray-900"
            />
          </div>
        </form>
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleFormClose}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
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
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 shadow-sm hover:shadow-md"
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

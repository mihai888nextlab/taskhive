import React, { useMemo } from "react";
import { useTheme } from "@/components/ThemeContext";

interface SecurityTabProps {
  accountDetails: {
    email: string;
    password: string;
    createdAt: string;
    firstName: string;
    lastName: string;
  } | null;
}

const SecurityTab: React.FC<SecurityTabProps> = React.memo((props) => {
  const { theme } = useTheme();
  const memoAccountDetails = useMemo(() => props.accountDetails, [props.accountDetails]);

  return (
    <div className={theme === "dark" ? "text-white w-full" : "text-gray-900 w-full"}>
      <div className="mb-8 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-1">Security</h2>
        <p className={`text-base mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Manage your password and view account details.</p>
      </div>
      <div className="space-y-8 sm:space-y-12 w-full">
        {memoAccountDetails ? (
          <>
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-row gap-6">
                <div className="flex-1">
                  <label className={`block text-xs text-gray-400 mb-1`}>First name</label>
                  <div className={`px-3 py-2 border rounded-md text-base ${theme === "dark" ? "border-gray-700 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}`}>{memoAccountDetails.firstName}</div>
                </div>
                <div className="flex-1">
                  <label className={`block text-xs text-gray-400 mb-1`}>Last name</label>
                  <div className={`px-3 py-2 border rounded-md text-base ${theme === "dark" ? "border-gray-700 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}`}>{memoAccountDetails.lastName}</div>
                </div>
              </div>
              <div className="flex flex-row gap-6">
                <div className="flex-1">
                  <label className={`block text-xs text-gray-400 mb-1`}>Email</label>
                  <div className={`px-3 py-2 border rounded-md text-base ${theme === "dark" ? "border-gray-700 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}`}>{memoAccountDetails.email}</div>
                </div>
                <div className="flex-1">
                  <label className={`block text-xs text-gray-400 mb-1`}>Account created</label>
                  <div className={`px-3 py-2 border rounded-md text-base ${theme === "dark" ? "border-gray-700 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}`}>{new Date(memoAccountDetails.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className={`italic mt-4 sm:mt-6 text-base ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Loading account details...</p>
        )}
      </div>
    </div>
  );
});

export default React.memo(SecurityTab);
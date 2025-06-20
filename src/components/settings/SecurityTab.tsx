import React from "react";

interface SecurityTabProps {
  accountDetails: {
    email: string;
    password: string;
    createdAt: string;
    firstName: string;
    lastName: string;
  } | null;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ accountDetails }) => (
  <div>
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
      Security
    </h2>
    <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 border-b border-gray-200 pb-4 sm:pb-6">
      Manage your password and view account details.
    </p>
    {accountDetails ? (
      <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            First Name
          </label>
          <p className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
            {accountDetails.firstName}
          </p>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Last Name
          </label>
          <p className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
            {accountDetails.lastName}
          </p>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <p className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
            {accountDetails.email}
          </p>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Account Created
          </label>
          <p className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
            {new Date(accountDetails.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    ) : (
      <p className="text-gray-500 italic mt-6">
        Loading account details...
      </p>
    )}
  </div>
);

export default SecurityTab;
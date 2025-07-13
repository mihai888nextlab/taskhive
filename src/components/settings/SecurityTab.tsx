import React, { useMemo } from "react";

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
  // Memoize accountDetails
  const memoAccountDetails = useMemo(
    () => props.accountDetails,
    [props.accountDetails]
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
      <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 text-gray-900">
        Security
      </h2>
      <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4">
        Manage your password and view account details.
      </p>
      {memoAccountDetails ? (
        <div className="space-y-3 sm:space-y-6 mt-2 sm:mt-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1 sm:mb-2">
              First Name
            </label>
            <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800 text-sm sm:text-base">
              {memoAccountDetails.firstName}
            </p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1 sm:mb-2">
              Last Name
            </label>
            <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800 text-sm sm:text-base">
              {memoAccountDetails.lastName}
            </p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1 sm:mb-2">
              Email
            </label>
            <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800 text-sm sm:text-base">
              {memoAccountDetails.email}
            </p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1 sm:mb-2">
              Account Created
            </label>
            <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800 text-sm sm:text-base">
              {new Date(memoAccountDetails.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic mt-4 sm:mt-6 text-sm sm:text-base">
          Loading account details...
        </p>
      )}
    </div>
  );
});

export default React.memo(SecurityTab);
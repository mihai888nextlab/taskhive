import React from "react";

interface ProfileTabProps {
  formData: { firstName: string; lastName: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  theme: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  formData,
  onInputChange,
  onSubmit,
  theme,
}) => (
  <div className={`text-${theme === 'light' ? 'gray-900' : 'white'} `}>
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
      Personal Information
    </h2>
    <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 border-b border-gray-200 pb-4 sm:pb-6">
      Update your personal details. This information will be displayed publicly, so be careful what you share.
    </p>
    <form className="space-y-6 sm:space-y-8 mt-4 sm:mt-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <div>
          <label htmlFor="firstName" className="block text-gray-300 font-medium mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-gray-300 font-medium mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
            placeholder="Enter your last name"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200 mt-6 sm:mt-8">
        <button
          type="button"
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-semibold shadow"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
);

export default ProfileTab;
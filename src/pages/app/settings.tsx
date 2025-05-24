import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
];

const SettingsPage: NextPageWithLayout = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [accountDetails, setAccountDetails] = useState<{
    email: string;
    password: string;
    createdAt: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile updated successfully:", data);

        alert("Profile updated successfully!");
        // Consider updating local state instead of full reload for smoother UX
        // window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (activeTab === "profile") {
      const fetchProfileData = async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = await res.json();
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
            });
          } else {
            console.error("Failed to fetch profile data:", res.status, res.statusText);
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      };
      fetchProfileData();
    }

    if (activeTab === "security") {
      const fetchAccountDetails = async () => {
        try {
          const res = await fetch("/api/security");
          if (res.ok) {
            const data = await res.json();
            setAccountDetails(data);
          } else {
            console.error("Failed to fetch account details:", res.status, res.statusText);
            setAccountDetails(null);
          }
        } catch (error) {
          console.error("Error fetching account details:", error);
          setAccountDetails(null);
        }
      };
      fetchAccountDetails();
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-1/4 max-w-xs bg-white border-r border-gray-200 p-8 shadow-sm">
        <h2 className="text-3xl font-extrabold mb-8 text-gray-900">Settings</h2>
        <nav>
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li
                key={tab.id}
                className={`cursor-pointer px-4 py-3 rounded-md text-lg transition-all duration-200 ease-in-out
                  ${
                    activeTab === tab.id
                      ? "bg-blue-400 text-white shadow-md" // Changed to gray-800 background, no bold text
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-white border-l border-gray-200 rounded-lg shadow-lg mx-8 my-8">
        {activeTab === "profile" && (
          <div>
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Personal Information
            </h2>
            <p className="text-gray-700 text-lg mb-8 border-b border-gray-200 pb-6">
              Update your personal details. This information will be displayed
              publicly, so be careful what you share.
            </p>
            <form className="space-y-8 mt-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-semibold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">Security</h2>
            <p className="text-gray-700 text-lg mb-8 border-b border-gray-200 pb-6">
              Manage your password and view account details.
            </p>
            {accountDetails ? (
              <div className="space-y-6 mt-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    First Name
                  </label>
                  <p className="px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
                    {accountDetails.firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Last Name
                  </label>
                  <p className="px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
                    {accountDetails.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <p className="px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
                    {accountDetails.email}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={accountDetails.password}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 focus:outline-none text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Account Created
                  </label>
                  <p className="px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-800">
                    {new Date(accountDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-6">Loading account details...</p>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Notifications
            </h2>
            <p className="text-gray-700 text-lg mb-8 border-b border-gray-200 pb-6">
              Customize your notification preferences.
            </p>
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              <p>Notification settings will go here (e.g., email alerts, push notifications).</p>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div>
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Appearance
            </h2>
            <p className="text-gray-700 text-lg mb-8 border-b border-gray-200 pb-6">
              Switch between light and dark mode, or customize themes.
            </p>
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              <p>Appearance settings will go here (e.g., theme selection, font size).</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Assign the layout to the page
SettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SettingsPage;
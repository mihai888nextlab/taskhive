import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { useState } from "react";

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
  
        // Reload the page after a successful update
        alert("Profile updated successfully!");
        window.location.reload(); // Reload the page
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-w-full min-h-screen bg-gray-50 text-gray-800 flex">
      {/* Sidebar */}
      <aside className="w-[300px] bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>
        <ul className="space-y-4">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`cursor-pointer p-3 rounded-lg text-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:shadow-sm"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white shadow-lg rounded-lg p-8 ml-6">
        {activeTab === "profile" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Personal Information
            </h2>
            <p className="text-gray-600 mb-8">
              Update your personal details. This information will be displayed
              publicly, so be careful what you share.
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Security</h2>
            <p className="text-gray-600">
              Manage your password and enable two-factor authentication.
            </p>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Notifications
            </h2>
            <p className="text-gray-600">
              Customize your notification preferences.
            </p>
          </div>
        )}

        {activeTab === "appearance" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Appearance
            </h2>
            <p className="text-gray-600">Switch between light and dark mode.</p>
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
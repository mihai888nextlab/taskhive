import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { useTheme } from '@/components/ThemeContext';
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileTab from "@/components/settings/ProfileTab";
import SecurityTab from "@/components/settings/SecurityTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import AppearanceTab from "@/components/settings/AppearanceTab";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
];

const SettingsPage: NextPageWithLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    description: "",
  });
  const [accountDetails, setAccountDetails] = useState<{
    email: string;
    password: string;
    createdAt: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        alert("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update profile. Please try again.");
      }
    } catch (error) {
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
              description: data.description || "",
            });
          }
        } catch {}
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
            setAccountDetails(null);
          }
        } catch {
          setAccountDetails(null);
        }
      };
      fetchAccountDetails();
    }
  }, [activeTab]);

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-gray-100 text-${theme === 'light' ? 'gray-900' : 'white'}`}>
      <SettingsSidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
      />
      <main className={`flex-1 p-2 sm:p-4 md:p-10 bg-${theme === 'light' ? 'white' : 'gray-800'} border-l border-gray-200 rounded-lg shadow-lg mx-0 md:mx-8 my-4 md:my-8`}>
        {activeTab === "profile" && (
          <ProfileTab
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            theme={theme}
          />
        )}
        {activeTab === "security" && (
          <SecurityTab accountDetails={accountDetails} />
        )}
        {activeTab === "notifications" && (
          <NotificationsTab />
        )}
        {activeTab === "appearance" && (
          <AppearanceTab theme={theme} toggleTheme={toggleTheme} />
        )}
      </main>
    </div>
  );
};

SettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SettingsPage;
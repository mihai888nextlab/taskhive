import React, { useState, useEffect } from "react";
import { NextPageWithLayout } from "@/types";
import { useTheme } from "@/components/ThemeContext";
import ProfileTab from "@/components/settings/ProfileTab";
import SecurityTab from "@/components/settings/SecurityTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import AppearanceTab from "@/components/settings/AppearanceTab";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
];

const SettingsPage: NextPageWithLayout = () => {
  const { user, refetchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  // Set tab from hash on load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && tabs.some(tab => tab.id === hash)) {
      setActiveTab(hash);
    }
    const onHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && tabs.some(tab => tab.id === newHash)) {
        setActiveTab(newHash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update hash when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState<string>("");
  type FormData = {
    firstName: string;
    lastName: string;
    profilePhoto: string;
    description: string;
    skills: string[];
  };

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    profilePhoto: "",
    description: "",
    skills: [],
  });

  const [accountDetails, setAccountDetails] = useState<{
    email: string;
    password: string;
    createdAt: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("idle");
    setSaveMessage("");
    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (res.ok) {
        setSaveStatus("success");
        setSaveMessage("Profile saved successfully!");
      } else {
        setSaveStatus("error");
        setSaveMessage("Failed to save profile.");
      }
    } catch {
      setSaveStatus("error");
      setSaveMessage("Failed to save profile.");
    }
  };

  useEffect(() => {
    if (activeTab === "profile") {
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        profilePhoto:
          (typeof user?.profileImage == "object"
            ? user.profileImage?.data
            : "") || "",
        description: user?.description || "",
        skills: user?.skills || [],
      });
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
  }, [activeTab, user]);

  return (
    <div className={`relative min-h-screen w-full ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} pt-6`}>
      <div className="sticky top-0 z-20">
        <div className="flex justify-center">
          <nav
            className={`flex flex-row items-center justify-between gap-2 md:gap-6 py-4 px-8 rounded-lg shadow-sm mx-4 md:mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            style={{ maxWidth: '640px', width: '100%' }}
          >
            {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 text-base md:text-lg focus:outline-none
                ${activeTab === tab.id
                  ? (theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900 border-b-2 border-blue-500")
                  : (theme === "dark"
                      ? "hover:bg-gray-700 text-white"
                      : "hover:bg-gray-100 text-gray-900")}
              `}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
            ))}
          </nav>
        </div>
      </div>
      <main className="w-full py-4 px-2 sm:px-6">
        {activeTab === "profile" && (
          <section className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md p-6 mb-8 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} w-full max-w-none`}>
            {saveStatus !== "idle" && (
              <div className={`mb-4 px-4 py-2 rounded font-medium shadow-sm ${saveStatus === "success" ? theme === "dark" ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800" : theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`}>
                {saveMessage}
              </div>
            )}
            <ProfileTab
              formData={formData}
              onInputChange={handleInputChange}
              onSkillsChange={handleSkillsChange}
              onSubmit={handleSubmit}
              theme={theme}
            />
          </section>
        )}
        {activeTab === "security" && (
          <section className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md p-6 mb-8 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <SecurityTab accountDetails={accountDetails} />
          </section>
        )}
        {activeTab === "notifications" && (
          <section className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md p-6 mb-8 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <NotificationsTab />
          </section>
        )}
        {activeTab === "appearance" && (
          <section className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md p-6 mb-8 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <AppearanceTab toggleTheme={toggleTheme} />
          </section>
        )}
      </main>
    </div>
  );
  // ...existing code...
};

export default SettingsPage;

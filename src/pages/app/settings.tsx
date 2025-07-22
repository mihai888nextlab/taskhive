import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { useTheme } from "@/components/ThemeContext";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
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
    <>
      <div
        className={`flex flex-col md:flex-row min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
      >
        <SettingsSidebar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
        />
        <main
          className={`flex-1 w-full p-2 sm:p-4 md:p-10 
          ${theme === "dark" ? "bg-gray-800 border-l border-gray-700 md:rounded-lg md:shadow-lg text-white" : "bg-white border-l border-gray-200 md:rounded-lg md:shadow-lg text-gray-900"}
          mx-0 md:mx-8 my-2 md:my-8 min-h-[60vh]`}
        >
          {activeTab === "profile" && (
            <>
              {saveStatus !== "idle" && (
                <div
                  className={`mb-4 px-4 py-2 rounded font-medium shadow-sm ${
                    saveStatus === "success"
                      ? theme === "dark"
                        ? "bg-green-900 text-green-200"
                        : "bg-green-100 text-green-800"
                      : theme === "dark"
                        ? "bg-red-900 text-red-200"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {saveMessage}
                </div>
              )}
              <div className={theme === "dark" ? "text-white" : ""}>
                <ProfileTab
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSkillsChange={handleSkillsChange}
                  onSubmit={handleSubmit}
                  theme={theme}
                />
              </div>
            </>
          )}
          {activeTab === "security" && (
            <div className={theme === "dark" ? "text-white" : ""}>
              <SecurityTab accountDetails={accountDetails} />
            </div>
          )}
          {activeTab === "notifications" && (
            <div className={theme === "dark" ? "text-white" : ""}>
              <NotificationsTab />
            </div>
          )}
          {activeTab === "appearance" && (
            <div className={theme === "dark" ? "text-white" : ""}>
              <AppearanceTab theme={theme} toggleTheme={toggleTheme} />
            </div>
          )}
        </main>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .settings-sidebar-mobile {
            position: sticky;
            top: 0;
            z-index: 10;
            background: inherit;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: none;
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            width: 100vw;
            max-width: 100vw;
            padding: 0.5rem 0.5rem 0 0.5rem;
          }
          .settings-sidebar-mobile ul {
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            width: 100%;
          }
          .settings-sidebar-mobile li {
            min-width: 110px;
            text-align: center;
            border-radius: 0.75rem;
            font-size: 1rem;
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default SettingsPage;

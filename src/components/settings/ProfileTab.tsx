import React, { useState, useMemo } from "react";
import { PREDEFINED_SKILLS } from "@/constants/skills";

interface ProfileTabProps {
  formData: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    description?: string;
    skills?: string[];
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSkillsChange: (skills: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  theme: string;
}

const ProfileTab: React.FC<ProfileTabProps> = React.memo((props) => {
  const { formData, onInputChange, onSkillsChange, onSubmit, theme } = props;

  const [photoPreview, setPhotoPreview] = useState<string>(formData.profilePhoto || "");
  const [uploading, setUploading] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [skills, setSkills] = useState<string[]>(formData.skills || []);

  const memoFormData = useMemo(() => formData, [formData]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-profile-photo", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setPhotoPreview(data.profileImage?.data);
    setUploading(false);
  };

  const handleSkillSelect = (skill: string) => {
    if (!skills.includes(skill)) {
      const updated = [...skills, skill];
      setSkills(updated);
      onSkillsChange(updated);
    }
    setCustomSkill(""); // Clear search/add box after adding
  };

  const handleSkillRemove = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    onSkillsChange(updated);
  };

  const handleCustomSkillAdd = () => {
    const skill = customSkill.trim();
    if (
      skill &&
      !skills.includes(skill) &&
      !PREDEFINED_SKILLS.some(
        (pre) => pre.toLowerCase() === skill.toLowerCase()
      )
    ) {
      const updated = [...skills, skill];
      setSkills(updated);
      onSkillsChange(updated);
      setCustomSkill("");
    }
  };

  // Sync skills prop with local state if parent updates
  React.useEffect(() => {
    setSkills(formData.skills || []);
  }, [formData.skills]);

  // Filtered skills for search/add
  const filteredSkills = PREDEFINED_SKILLS.filter(
    (s) =>
      !skills.includes(s) &&
      s.toLowerCase().includes(customSkill.trim().toLowerCase())
  );

  const skillsToShow =
    customSkill.trim() === ""
      ? PREDEFINED_SKILLS.filter((s) => !skills.includes(s)).slice(0, 10)
      : filteredSkills;

  const uniqueSkillsToShow = Array.from(new Set(skillsToShow));

  return (
    <div className={theme === "dark" ? "text-white w-full" : "text-gray-900 w-full"}>
      {/* Account Section */}
      <div className="mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-1">Account</h2>
        <p className={`text-base mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Real-time information and activities of your property.</p>
      </div>
      <form className="space-y-6 sm:space-y-8 mt-4 sm:mt-6 w-full" onSubmit={onSubmit}>
        {/* Profile Photo + Name Row */}
        <div className="flex flex-row items-center gap-4 sm:gap-6 mb-4">
          <img
            src={photoPreview || "/hive-icon.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border border-blue-400"
          />
          <div className="flex flex-col gap-1 min-w-[140px]">
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Profile picture</span>
            <span className="text-xs text-gray-400">PNG, JPEG under 15MB</span>
            <div className="flex gap-2 mt-1">
              <label className={`px-3 py-1 rounded border cursor-pointer text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Upload new picture
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              <button type="button" className={`px-3 py-1 rounded border text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Delete</button>
            </div>
            {uploading && <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}>Uploading...</span>}
          </div>
          {/* Name Inputs */}
          <div className="flex flex-row gap-4 flex-1">
            <div className="flex-1">
              <label htmlFor="firstName" className="text-xs text-gray-400 mb-1 block">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={onInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-base ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                placeholder="First name"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="text-xs text-gray-400 mb-1 block">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={onInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-base ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                placeholder="Last name"
              />
            </div>
          </div>
        </div>
        {/* Contact Email Section (commented out, add to formData if needed) */}
        {/*
        <div className="mb-6">
          <span className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Contact email</span>
          <label htmlFor="email" className="text-xs text-gray-400 mb-1 block">Email</label>
          <div className="flex gap-2 items-center">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={onInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-base ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
              placeholder="Email address"
            />
            <button type="button" className={`px-3 py-1 rounded border text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Add another email</button>
          </div>
        </div>
        */}
        {/* About Me Section */}
        <div className="mb-6">
          <span className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>About Me</span>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-base ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>
        {/* Skills Section - moved up */}
        <div className="mb-6">
          <span className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Skills</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className={`px-3 py-1 rounded-full flex items-center text-sm ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}
              >
                {skill}
                <button
                  type="button"
                  className={`ml-2 ${theme === 'dark' ? 'text-red-300 hover:text-red-500' : 'text-red-500 hover:text-red-700'}`}
                  onClick={() => handleSkillRemove(skill)}
                  aria-label="Remove skill"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {uniqueSkillsToShow.map((skill) => (
              <button
                key={skill}
                type="button"
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 hover:bg-blue-900 text-gray-200' : 'bg-gray-200 hover:bg-blue-200 text-gray-700'}`}
                onClick={() => handleSkillSelect(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
          <div className="flex flex-col xs:flex-row gap-2 mt-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className={`border rounded-md px-2 py-1 ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
              placeholder="Add or search skill"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomSkillAdd();
                  e.preventDefault();
                }
              }}
            />
            <button
              type="button"
              className={`px-3 py-1 rounded font-semibold transition-colors duration-200 ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              onClick={handleCustomSkillAdd}
            >
              Add
            </button>
          </div>
        </div>
        {/* Save/Cancel Buttons - moved up */}
        <div className={`flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t mt-6 sm:mt-8 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            type="button"
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold transition-all duration-200 ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold transition-all duration-200 shadow ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
});

export default React.memo(ProfileTab);
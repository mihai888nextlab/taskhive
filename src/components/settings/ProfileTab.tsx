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
    <div className={`text-${theme === "light" ? "gray-900" : "white"} `}>
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
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            Profile Photo
          </label>
          <div className="flex flex-col md:flex-row md:items-center items-center gap-3 sm:gap-4 justify-center md:justify-start md:items-start">
            <img
              src={photoPreview || "/hive-icon.png"}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="w-full md:w-auto flex flex-col gap-2 items-center md:items-start">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 w-32 sm:w-40 md:w-auto"
              />
              {uploading && <span className="text-gray-400">Uploading...</span>}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            About Me
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>
        {/* Skills Section */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            Skills
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm"
              >
                {skill}
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
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
                className="bg-gray-200 hover:bg-blue-200 text-gray-700 px-3 py-1 rounded-full text-sm"
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
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-900"
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
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={handleCustomSkillAdd}
            >
              Add
            </button>
          </div>
        </div>
        {/* End Skills Section */}
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
});

export default React.memo(ProfileTab);
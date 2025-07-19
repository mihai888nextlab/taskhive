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
    <div className={theme === "dark" ? "text-white" : "text-gray-900"}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
        Personal Information
      </h2>
      <p className={`text-base sm:text-lg mb-6 sm:mb-8 border-b pb-4 sm:pb-6 ${theme === 'dark' ? 'text-gray-300 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Update your personal details. This information will be displayed publicly, so be careful what you share.</p>
      <form className="space-y-6 sm:space-y-8 mt-4 sm:mt-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <div>
            <label htmlFor="firstName" className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={onInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={onInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
              placeholder="Enter your last name"
            />
          </div>
        </div>
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Profile Photo</label>
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
                className={`border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 w-32 sm:w-40 md:w-auto ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300'}`}
              />
              {uploading && <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}>Uploading...</span>}
            </div>
          </div>
        </div>
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>About Me</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ${theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>
        {/* Skills Section */}
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Skills</label>
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
        {/* End Skills Section */}
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
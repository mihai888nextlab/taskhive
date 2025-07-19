import React from "react";
import { FaSave } from "react-icons/fa";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface SessionFormProps {
  sessionName: string;
  sessionDescription: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  theme: string;
  sessionTag: string;
  setSessionTag: (v: string) => void;
}

const SessionForm: React.FC<SessionFormProps> = React.memo(({
  sessionName,
  sessionDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  theme,
  sessionTag,
  setSessionTag,
}) => {
  const t = useTranslations("TimeTrackingPage");
  const tags = ["General", "Deep Work", "Meeting", "Break", "Learning"];

  return (
    <div className="transition-all duration-500 ease-in-out py-4">
      <div
        className={`bg-${theme === 'light' ? 'gray-50' : 'gray-800'} p-4 md:p-6 rounded-2xl border border-gray-200 animate-fadeIn`}
      >
        <h2 className={`text-2xl font-bold text-${theme === 'light' ? 'gray-800' : 'white'} mb-4 text-center`}>
          {t("logNewSession")}
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="sessionName" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-1 after:content-['*'] after:ml-0.5 after:text-red-500`}>
                {t("sessionName")}:
              </label>
              <input
                type="text"
                id="sessionName"
                className={`w-full py-2 px-3 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base`}
                placeholder={t("sessionName")}
                value={sessionName}
                onChange={e => onNameChange(e.target.value)}
                required
                aria-label="Session name"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="sessionDescription" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-1`}>
                {t("sessionDescription")} ({t("descriptionOptional")})
              </label>
              <input
                type="text"
                id="sessionDescription"
                className={`w-full py-2 px-3 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base`}
                placeholder={t("addNotesContext")}
                value={sessionDescription}
                onChange={e => onDescriptionChange(e.target.value)}
                aria-label="Session description"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="sessionTag" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-1 after:content-['*'] after:ml-0.5 after:text-red-500`}>
                {t("tag")}:
              </label>
              <Select
                value={sessionTag}
                onValueChange={setSessionTag}
                required
              >
                <SelectTrigger
                  className={`w-full pl-9 pr-8 text-sm rounded-xl border min-w-[140px] transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}`}
                  style={{ height: "40px" }}
                >
                  <SelectValue placeholder={t("allCategories")} />
                </SelectTrigger>
                <SelectContent className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg p-0`}>
                  <SelectItem value="all" className={`${theme === 'dark' ? 'text-white bg-gray-800 hover:bg-green-900 focus:bg-green-900 data-[state=checked]:bg-green-900 data-[state=checked]:text-green-400' : 'text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700'} px-4 py-2 text-sm cursor-pointer transition-colors`}>All Categories</SelectItem>
                  {tags.map(tag => (
                    <SelectItem
                      key={tag}
                      value={tag}
                      className={`${theme === 'dark' ? 'text-white bg-gray-800 hover:bg-green-900 focus:bg-green-900 data-[state=checked]:bg-green-900 data-[state=checked]:text-green-400' : 'text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700'} px-4 py-2 text-sm cursor-pointer transition-colors`}
                    >
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-2 px-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-base"
            >
              <FaSave className="mr-2" />
              {t("saveSession")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default React.memo(SessionForm);
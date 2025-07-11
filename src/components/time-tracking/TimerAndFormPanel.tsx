import React from "react";
import { FaPlay, FaPause, FaStop, FaSave } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface TimerAndFormPanelProps {
  elapsedTime: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  theme: string;
  sessionName: string;
  sessionDescription: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  sessionTag: string;
  setSessionTag: (v: string) => void;
  // Pomodoro props
  pomodoroMode?: boolean;
  pomodoroPhase?: 'work' | 'break';
  pomodoroTime?: number;
  pomodoroCycles?: number;
  workDuration?: number;
  breakDuration?: number;
}

const TimerAndFormPanel: React.FC<TimerAndFormPanelProps> = ({
  elapsedTime,
  isRunning,
  onStart,
  onStop,
  onReset,
  theme,
  sessionName,
  sessionDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  sessionTag,
  setSessionTag,
  pomodoroMode = false,
  pomodoroPhase = 'work',
  pomodoroTime = 0,
  pomodoroCycles = 0,
  workDuration = 25 * 60,
  breakDuration = 5 * 60,
}) => {
  const t = useTranslations("TimeTrackingPage");

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  
  const tags = ["General", "Deep Work", "Meeting", "Break", "Learning"];

  // Pomodoro progress
  const totalPhase = pomodoroPhase === 'work' ? workDuration : breakDuration;
  const progress = pomodoroMode ? ((totalPhase - (pomodoroTime || 0)) / totalPhase) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <div className="text-center">
        {pomodoroMode ? (
          <>
            <div className={`text-sm font-semibold mb-2 ${pomodoroPhase === 'work' ? 'text-red-600' : 'text-blue-600'}`}>
              {pomodoroPhase === 'work' ? t("workSession") : t("breakTime")} • {t("cycles", { count: pomodoroCycles })}
            </div>
            <div className={`w-full rounded-full h-2 mb-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${pomodoroPhase === 'work' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`text-3xl font-mono font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(pomodoroTime || 0)}
            </div>
          </>
        ) : (
          <div className={`text-3xl font-mono font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(elapsedTime)}
          </div>
        )}
        
        {/* Timer Controls */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            onClick={onStart}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <FaPlay className="w-3 h-3" />
            {t("start")}
          </Button>
          <Button
            onClick={onStop}
            disabled={!isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              !isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <FaPause className="w-3 h-3" />
            {t("stop")}
          </Button>
          <Button
            onClick={onReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            <FaStop className="w-3 h-3" />
            {t("reset")}
          </Button>
        </div>
      </div>

      {/* Session Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          onSave();
        }}
        className="space-y-4"
      >
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t("sessionName")}
          </label>
          <Input
            type="text"
            value={sessionName}
            onChange={e => onNameChange(e.target.value)}
            placeholder={t("sessionName")}
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t("sessionDescription")}
          </label>
          <Textarea
            value={sessionDescription}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder={t("addNotesContext")}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 resize-none ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t("tag")}
          </label>
          <Select
            value={sessionTag}
            onValueChange={setSessionTag}
            required
            disabled={false}
          >
            <SelectTrigger
              className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 min-w-[140px]"
            >
              <SelectValue placeholder={t("selectCategory")} />
            </SelectTrigger>
            <SelectContent
              className="bg-white border border-gray-300 rounded-lg p-0"
            >
              {tags.map(tag => (
                <SelectItem
                  key={tag}
                  value={tag}
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={!sessionName || !sessionDescription || !sessionTag}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
            !sessionName || !sessionDescription || !sessionTag
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <FaSave className="w-4 h-4" />
          {t("saveSession")}
        </Button>
      </form>
    </div>
  );
};

export default TimerAndFormPanel;

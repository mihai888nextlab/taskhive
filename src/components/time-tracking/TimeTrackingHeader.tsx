import React from "react";
import { FaFileCsv, FaFire } from "react-icons/fa";
import { GiTomato } from "react-icons/gi";
import { useTranslations } from "next-intl";

interface Props {
  theme: string;
  streak: number;
  pomodoroMode: boolean;
  onExport: () => void;
  onPomodoroToggle: () => void;
}

const TimeTrackingHeader: React.FC<Props> = ({
  theme,
  streak,
  pomodoroMode,
  onExport,
  onPomodoroToggle,
}) => {
  const t = useTranslations("TimeTrackingPage");
  return (
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onExport}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            theme === "dark"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <FaFileCsv className="w-3 h-3" />
          {t("export")}
        </button>
        <button
          onClick={onPomodoroToggle}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            pomodoroMode
              ? theme === "dark"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-500 text-white hover:bg-red-600"
              : theme === "dark"
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          <GiTomato className="w-3 h-3" />
          {pomodoroMode ? t("exit") : t("pomodoro")}
        </button>
      </div>

      {/* Streak Display */}
      <div
        className={`text-center p-3 rounded-lg ${
          theme === "dark"
            ? "bg-green-900/20 border border-green-700"
            : "bg-green-50 border border-green-200"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <FaFire className="text-orange-500" />
          <span
            className={`font-semibold ${
              theme === "dark" ? "text-green-400" : "text-green-700"
            }`}
          >
            {t("streak", { count: streak })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingHeader;
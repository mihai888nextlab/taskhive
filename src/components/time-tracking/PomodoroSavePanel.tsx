import React from "react";
import { useTranslations } from "next-intl";

interface Props {
  onSave: () => void;
  message: string;
}

const PomodoroSavePanel: React.FC<Props> = React.memo(({ onSave, message }) => {
  const t = useTranslations("TimeTrackingPage");
  return (
    <div className="flex flex-col items-center mb-8">
      <button
        className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition-all text-lg"
        onClick={onSave}
      >
        {t("savePomodoroSession")}
      </button>
      {message && (
        <div className="mt-3 text-red-600 font-semibold text-center">
          {message}
        </div>
      )}
    </div>
  );
});

export default React.memo(PomodoroSavePanel);
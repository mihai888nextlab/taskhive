import React from "react";
import { FaFire } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface Props {
  theme: string;
  streak: number;
}

const TimeTrackingHeader: React.FC<Props> = React.memo(({ theme, streak }) => {
  const t = useTranslations("TimeTrackingPage");
  return (
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
  );
});

export default React.memo(TimeTrackingHeader);
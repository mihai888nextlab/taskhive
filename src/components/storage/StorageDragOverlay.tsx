import React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeContext";

const StorageDragOverlay: React.FC = () => {
  const t = useTranslations("StoragePage");
  const { theme } = useTheme();
  return (
    <div className={`absolute inset-0 flex items-center justify-center z-50 pointer-events-none text-lg sm:text-2xl font-bold px-2 text-center transition-all duration-200 ${theme === 'dark' ? 'bg-blue-900 bg-opacity-70 text-blue-200' : 'bg-blue-100 bg-opacity-60 text-blue-700'}`}>
      {t("dropFilesToUpload")}
    </div>
  );
};

export default React.memo(StorageDragOverlay);
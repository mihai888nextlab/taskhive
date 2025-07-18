import React from "react";
import { useTranslations } from "next-intl";

const StorageDragOverlay: React.FC = () => {
  const t = useTranslations("StoragePage");
  return (
    <div className="absolute inset-0 bg-blue-100 bg-opacity-60 flex items-center justify-center z-50 pointer-events-none text-lg sm:text-2xl font-bold text-blue-700 px-2 text-center">
      {t("dropFilesToUpload")}
    </div>
  );
};

export default React.memo(StorageDragOverlay);
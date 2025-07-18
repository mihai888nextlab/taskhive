import React from "react";
import { IoIosDocument } from "react-icons/io";
import { useTranslations } from "next-intl";

export interface FileCardProps {
  fileName: string;
  fileSize: number;
  downloadUrl?: string;
  theme: string;
  fileIcon?: React.ReactNode;
  children?: React.ReactNode;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " B";
}

const FileCard: React.FC<FileCardProps> = React.memo(
  ({
    fileName,
    fileSize,
    downloadUrl,
    theme,
    children,
  }) => {
    const t = useTranslations("StoragePage");
    return (
      <div
        className={`p-2 sm:p-4 rounded-xl sm:rounded-lg ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
        } border border-gray-200 sm:border-0 w-full max-w-full`}
      >
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <IoIosDocument className="text-xl sm:text-3xl text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div
              className={`font-semibold text-xs sm:text-base truncate ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
              title={fileName}
            >
              {fileName}
            </div>
            <div className="text-xs text-gray-500 truncate">{formatBytes(fileSize)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 w-full">
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-xs sm:text-base"
            >
              {t("download")}
            </a>
          )}
          {children}
        </div>
      </div>
    );
  }
);

export default React.memo(FileCard);

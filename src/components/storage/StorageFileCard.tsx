import React from "react";
import { IoIosDocument } from "react-icons/io";

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

const FileCard: React.FC<FileCardProps> = ({
  fileName,
  fileSize,
  downloadUrl,
  theme,
  children,
}) => (
  <div
    className={`p-3 sm:p-4 rounded-xl sm:rounded-lg ${
      theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
    } shadow-none sm:shadow-md border border-gray-200 sm:border-0`}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <IoIosDocument className="text-2xl sm:text-3xl text-primary" />
      <div>
        <div
          className={`font-semibold text-sm sm:text-base ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {fileName}
        </div>
        <div className="text-xs text-gray-500">{formatBytes(fileSize)}</div>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-xs sm:text-base"
        >
          Download
        </a>
      )}
      {children}
    </div>
  </div>
);

export default FileCard;

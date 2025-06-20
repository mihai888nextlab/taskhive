import React from "react";
import { IoIosDocument } from "react-icons/io";

export interface FileCardProps {
  fileName: string;
  fileSize: number;
  downloadUrl?: string;
  theme: string;
  fileIcon: React.ReactNode;
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
  fileIcon,
  children,
}) => (
  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md`}>
    <div className="flex items-center gap-3">
      <IoIosDocument className="text-3xl text-primary" />
      <div>
        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{fileName}</div>
        <div className="text-xs text-gray-500">{formatBytes(fileSize)}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Download
        </a>
      )}
      {children}
    </div>
  </div>
);

export default FileCard;

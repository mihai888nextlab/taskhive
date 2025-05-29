import React from "react";
import { IoIosDocument } from "react-icons/io";

interface FileCardProps {
  fileName: string;
  fileSize: number; // in bytes
  downloadUrl?: string;
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
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <IoIosDocument className="text-3xl text-primary" />
        <div>
          <div className="font-semibold text-gray-800">{fileName}</div>
          <div className="text-xs text-gray-500">{formatBytes(fileSize)}</div>
        </div>
      </div>
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition text-sm font-medium"
        >
          Download
        </a>
      )}
    </div>
  );
};

export default FileCard;

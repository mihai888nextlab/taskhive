import React, { useState } from "react";
import { FaPen, FaTrash, FaCheck, FaTimes, FaSignature, FaEye, FaDownload } from "react-icons/fa";
import FileSigningModal from "@/components/signature/FileSigningModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FileType = {
  _id: string;
  fileName: string;
  fileSize: number;
  fileLocation?: string;
  fileType?: string;
};

interface StorageFileListProps {
  files: FileType[];
  loading: boolean;
  theme: any;
  renamingId: string | null;
  renameValue: string;
  setRenamingId: (id: string | null) => void;
  setRenameValue: (value: string) => void;
  handleDelete: (fileId: string) => void;
  handleRename: (fileId: string) => void;
  getFileIcon: (fileName: string) => React.ReactElement;
  fetchFiles?: () => void;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " B";
}

const StorageFileList: React.FC<StorageFileListProps> = ({
  files,
  loading,
  theme,
  renamingId,
  renameValue,
  setRenamingId,
  setRenameValue,
  handleDelete,
  handleRename,
  getFileIcon,
  fetchFiles,
}) => {
  const [signingFile, setSigningFile] = useState<FileType | null>(null);

  const handleSignFile = (file: FileType) => {
    setSigningFile(file);
  };

  const handleSigningComplete = () => {
    if (typeof fetchFiles === 'function') {
      fetchFiles();
    }
    setSigningFile(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className={`mt-6 text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading your files...
        </p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className={`p-6 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          No files found
        </h3>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Upload some files to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.map((file) => (
          <div
            key={file._id}
            className={`group relative p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 ${
              theme === "dark" 
                ? "bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/70" 
                : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white/90"
            } shadow-lg hover:shadow-xl`}
          >
            {/* File Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl opacity-80 group-hover:opacity-100 transition-opacity">
                {getFileIcon(file.fileName)}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={() => handleSignFile(file)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Sign file"
                  variant="ghost"
                  size="icon"
                >
                  <FaSignature size={14} />
                </Button>
                <Button
                  onClick={() => {
                    setRenamingId(file._id);
                    setRenameValue(file.fileName);
                  }}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Rename"
                  variant="ghost"
                  size="icon"
                >
                  <FaPen size={14} />
                </Button>
                <Button
                  onClick={() => handleDelete(file._id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Delete"
                  variant="ghost"
                  size="icon"
                >
                  <FaTrash size={14} />
                </Button>
              </div>
            </div>

            {/* File Name */}
            {renamingId === file._id ? (
              <div className="mb-3">
                <Input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(file._id);
                    if (e.key === "Escape") {
                      setRenamingId(null);
                      setRenameValue("");
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => handleRename(file._id)}
                    className="flex-1 p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    variant="ghost"
                  >
                    <FaCheck size={12} />
                  </Button>
                  <Button
                    onClick={() => {
                      setRenamingId(null);
                      setRenameValue("");
                    }}
                    className="flex-1 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    variant="ghost"
                  >
                    <FaTimes size={12} />
                  </Button>
                </div>
              </div>
            ) : (
              <h3 className={`font-semibold text-sm mb-3 truncate group-hover:text-blue-600 transition-colors ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`} title={file.fileName}>
                {file.fileName}
              </h3>
            )}

            {/* File Size */}
            <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatBytes(file.fileSize)}
            </p>

            {/* Action Buttons */}
            {file.fileLocation && (
              <div className="flex gap-2">
                <a
                  href={file.fileLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm"
                >
                  <FaEye size={12} />
                  View
                </a>
                <a
                  href={file.fileLocation}
                  download={file.fileName}
                  className="flex items-center justify-center px-3 py-2 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-sm"
                >
                  <FaDownload size={12} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {signingFile && signingFile.fileLocation && signingFile.fileType && (
        <FileSigningModal
          isOpen={!!signingFile}
          onClose={() => setSigningFile(null)}
          file={{
            _id: signingFile._id,
            fileName: signingFile.fileName,
            fileLocation: signingFile.fileLocation,
            fileType: signingFile.fileType,
          }}
          onSigningComplete={handleSigningComplete}
        />
      )}
    </>
  );
};

export default StorageFileList;
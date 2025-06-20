import React from "react";
// Update the import path and/or filename to match the actual file location and name.
// For example, if the file is named 'StorageFileCard.tsx' in the same folder:
import FileCard from "@/components/storage/StorageFileCard";
// If the file is named differently or in a different folder, update accordingly, e.g.:
// import FileCard from "../storage/StorageFileCard";

interface FileType {
  _id: string;
  fileName: string;
  fileSize: number;
  fileLocation?: string;
}

interface StorageFileListProps {
  files: FileType[];
  loading: boolean;
  theme: string;
  renamingId: string | null;
  renameValue: string;
  setRenamingId: (id: string | null) => void;
  setRenameValue: (v: string) => void;
  handleDelete: (id: string) => void;
  handleRename: (id: string) => void;
  getFileIcon: (fileName: string) => React.ReactNode;
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
}) => (
  <div className="mt-10 max-w-2xl mx-auto space-y-4">
    {loading ? (
      <div className="text-center text-gray-500">Loading files...</div>
    ) : files.length === 0 ? (
      <div className="text-center text-gray-400">No files uploaded yet.</div>
    ) : (
      files.map((file) => (
        <FileCard
          key={file._id}
          fileName={file.fileName}
          fileSize={file.fileSize}
          downloadUrl={file.fileLocation}
          theme={theme}
          fileIcon={getFileIcon(file.fileName)}
        >
          <button
            className="text-red-500 hover:text-red-700 ml-2"
            onClick={() => handleDelete(file._id)}
          >
            Delete
          </button>
          {renamingId === file._id ? (
            <>
              <input
                className="ml-2 px-1 py-0.5 border rounded text-sm"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                autoFocus
              />
              <button
                className="text-green-600 hover:text-green-800 ml-1"
                onClick={() => handleRename(file._id)}
                type="button"
              >
                Save
              </button>
              <button
                className="text-gray-500 hover:text-gray-700 ml-1"
                onClick={() => setRenamingId(null)}
                type="button"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="text-blue-500 hover:text-blue-700 ml-2"
              onClick={() => {
                setRenamingId(file._id);
                setRenameValue(file.fileName);
              }}
              type="button"
            >
              Rename
            </button>
          )}
        </FileCard>
      ))
    )}
  </div>
);

export default StorageFileList;
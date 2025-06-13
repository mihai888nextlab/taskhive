import DashboardLayout from "@/components/DashboardLayout";
import FileUploadModal from "@/components/StorageFileUploadModal";
import FileCard from "@/components/StorageFileCard";
import { NextPageWithLayout } from "@/types";
import { useState, useEffect } from "react";
import { useTheme } from '@/components/ThemeContext';

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB in bytes

type FileType = {
  _id: string;
  fileName: string;
  fileSize: number;
  fileLocation?: string;
};

const Storage: NextPageWithLayout = () => {
  const { theme } = useTheme();
  const [files, setFiles] = useState<FileType[]>([]);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [uploadFileModal, setUploadFileModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const percentUsed = Math.min((usedStorage / MAX_STORAGE_BYTES) * 100, 100);

  function formatBytes(bytes: number) {
    if (bytes >= 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " B";
  }

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      try {
        const res = await fetch("/api/getFiles");
        const data = await res.json();
        if (res.ok && Array.isArray(data.files)) {
          setFiles(data.files);
          const total = data.files.reduce(
            (sum: number, file: FileType) => sum + (file.fileSize || 0),
            0
          );
          setUsedStorage(total);
        } else {
          setFiles([]);
          setUsedStorage(0);
        }
      } catch (err) {
        setFiles([]);
        setUsedStorage(0);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, [uploadFileModal]); // refetch after upload modal closes

  return (
    <div className={`p-8 bg-gray-100 text-gray-900 min-h-full rounded-lg`}>
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight">
        Storage Management
      </h1>
      <div className="max-w-2/3 mx-auto">
        <div className="mb-2 flex justify-between text-sm font-medium">
          <span>{formatBytes(usedStorage)} used</span>
          <span>{percentUsed.toFixed(1)}% of 1 GB</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden mb-6">
          <div
            className="bg-primary h-6 rounded-full transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
        <button
          className="bg-primary text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-primary-dark transition"
          onClick={() => setUploadFileModal(true)}
        >
          Upload File
        </button>
      </div>

      <div className="mt-10 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-400">
            No files uploaded yet.
          </div>
        ) : (
          files.map((file) => (
            <FileCard
              key={file._id}
              fileName={file.fileName}
              fileSize={file.fileSize}
              downloadUrl={file.fileLocation}
              theme={theme}
            />
          ))
        )}
      </div>

      <FileUploadModal
        open={uploadFileModal}
        onClose={() => setUploadFileModal(false)}
      />
    </div>
  );
};

Storage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Storage;

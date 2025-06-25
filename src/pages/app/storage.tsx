import DashboardLayout from "@/components/sidebar/DashboardLayout";
import FileUploadModal from "@/components/storage/StorageFileUploadModal";
import StorageHeader from "@/components/storage/StorageHeader";
import StorageSearchSort from "@/components/storage/StorageSearchSort";
import StorageFileList from "@/components/storage/StorageFileList";
import StorageDragOverlay from "@/components/storage/StorageDragOverlay";
import { useTheme } from '@/components/ThemeContext';
import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaFileImage, FaFileAlt, FaFileArchive, FaFile } from "react-icons/fa";

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB

type FileType = {
  _id: string;
  fileName: string;
  fileSize: number;
  fileLocation?: string;
};

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) return <FaFile />;
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(ext)) return <FaFileImage className="text-blue-400" />;
  if (["pdf"].includes(ext)) return <FaFilePdf className="text-red-500" />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <FaFileArchive className="text-yellow-500" />;
  if (["txt", "md", "doc", "docx"].includes(ext)) return <FaFileAlt className="text-gray-500" />;
  return <FaFile />;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " B";
}

const Storage = () => {
  const { theme } = useTheme();
  const [files, setFiles] = useState<FileType[]>([]);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [uploadFileModal, setUploadFileModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");
  const [droppedFiles, setDroppedFiles] = useState<FileList | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const percentUsed = Math.min((usedStorage / MAX_STORAGE_BYTES) * 100, 100);

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
  }, [uploadFileModal]);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDroppedFiles(e.dataTransfer.files);
      setUploadFileModal(true);
    }
  }

  const filteredFiles = files.filter(f =>
    f.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === "name") return a.fileName.localeCompare(b.fileName);
    if (sortBy === "size") return b.fileSize - a.fileSize;
    return 0;
  });

  async function handleDelete(fileId: string) {
    if (!window.confirm("Delete this file?")) return;
    try {
      const res = await fetch(`/api/getFiles?id=${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(files => {
          const updatedFiles = files.filter(f => f._id !== fileId);
          setUsedStorage(updatedFiles.reduce((sum, f) => sum + f.fileSize, 0));
          return updatedFiles;
        });
      } else {
        alert("Failed to delete file.");
      }
    } catch {
      alert("Failed to delete file.");
    }
  }

  async function handleRename(fileId: string) {
    if (!renameValue.trim()) return;
    try {
      const res = await fetch("/api/getFiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId, newName: renameValue }),
      });
      if (res.ok) {
        setFiles(files =>
          files.map(f =>
            f._id === fileId ? { ...f, fileName: renameValue } : f
          )
        );
        setRenamingId(null);
        setRenameValue("");
      } else {
        alert("Failed to rename file.");
      }
    } catch {
      alert("Failed to rename file.");
    }
  }

  return (
    <div
      className={`relative p-8 bg-gray-100 min-h-screen rounded-lg ${dragActive ? "ring-4 ring-blue-400" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight">
        Storage Management
      </h1>
      <StorageHeader
        usedStorage={usedStorage}
        percentUsed={percentUsed}
        onUploadClick={() => setUploadFileModal(true)}
        formatBytes={formatBytes}
      />
      <StorageSearchSort
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <StorageFileList
        files={sortedFiles}
        loading={loading}
        theme={theme}
        renamingId={renamingId}
        renameValue={renameValue}
        setRenamingId={setRenamingId}
        setRenameValue={setRenameValue}
        handleDelete={handleDelete}
        handleRename={handleRename}
        getFileIcon={getFileIcon}
      />
      <FileUploadModal
        open={uploadFileModal}
        onClose={() => {
          setUploadFileModal(false);
          setDroppedFiles(null);
        }}
        droppedFiles={droppedFiles}
        onUploadSuccess={() => {
          setUploadFileModal(false);
          setDroppedFiles(null);
        }}
      />
      {dragActive && <StorageDragOverlay />}
    </div>
  );
};

Storage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Storage;
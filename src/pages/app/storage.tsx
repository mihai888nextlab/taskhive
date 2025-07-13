import DashboardLayout from "@/components/sidebar/DashboardLayout";
import FileUploadModal from "@/components/storage/StorageFileUploadModal";
import StorageHeader from "@/components/storage/StorageHeader";
import StorageSearchSort from "@/components/storage/StorageSearchSort";
import StorageFileList from "@/components/storage/StorageFileList";
import StorageDragOverlay from "@/components/storage/StorageDragOverlay";
import SignatureModal from "@/components/signature/SignatureModal";
import FileSigningModal from "@/components/signature/FileSigningModal";
import { useTheme } from '@/components/ThemeContext';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Add this import
import { FaFile, FaFileImage, FaFilePdf, FaFileArchive, FaFileAlt, FaSignature, FaCloudUploadAlt } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB

type FileType = {
  _id: string;
  fileName: string;
  fileSize: number;
  fileLocation?: string;
  fileType?: string;
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

function Storage() {
  const { theme } = useTheme();
  const [files, setFiles] = useState<FileType[]>([]);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [uploadFileModal, setUploadFileModal] = useState<boolean>(false);
  const [signatureModal, setSignatureModal] = useState<boolean>(false);
  const [fileSigningModal, setFileSigningModal] = useState<boolean>(false);
  const [selectedFileForSigning, setSelectedFileForSigning] = useState<FileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");
  const [droppedFiles, setDroppedFiles] = useState<FileList | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const t = useTranslations("StoragePage");

  // Memoize percentUsed
  const percentUsed = useMemo(() => Math.min((usedStorage / MAX_STORAGE_BYTES) * 100, 100), [usedStorage]);

  // Make fetchFiles accessible to other parts of the component
  // Memoize fetchFiles
  const fetchFiles = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [uploadFileModal, fetchFiles]);

  // Memoize drag handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDroppedFiles(e.dataTransfer.files);
      setUploadFileModal(true);
    }
  }, []);

  // Memoize filteredFiles
  const filteredFiles = useMemo(() => (
    files.filter(f =>
      f.fileName.toLowerCase().includes(search.toLowerCase())
    )
  ), [files, search]);

  // Memoize sortedFiles
  const sortedFiles = useMemo(() => {
    const arr = [...filteredFiles];
    if (sortBy === "name") return arr.sort((a, b) => a.fileName.localeCompare(b.fileName));
    if (sortBy === "size") return arr.sort((a, b) => b.fileSize - a.fileSize);
    return arr;
  }, [filteredFiles, sortBy]);

  // Memoize handleDelete
  const handleDelete = useCallback(async (fileId: string) => {
    if (!window.confirm(t("deleteFileConfirm"))) return;
    try {
      const res = await fetch(`/api/getFiles?id=${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(files => {
          const updatedFiles = files.filter(f => f._id !== fileId);
          setUsedStorage(updatedFiles.reduce((sum, f) => sum + f.fileSize, 0));
          return updatedFiles;
        });
      } else {
        alert(t("deleteFileError"));
      }
    } catch {
      alert(t("deleteFileError"));
    }
  }, [t]);

  // Memoize handleRename
  const handleRename = useCallback(async (fileId: string) => {
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
        alert(t("renameFileError"));
      }
    } catch {
      alert(t("renameFileError"));
    }
  }, [renameValue, t]);

  // Memoize handleSignFile
  const handleSignFile = useCallback((file: FileType) => {
    setSelectedFileForSigning(file);
    setFileSigningModal(true);
  }, []);

  // Memoize handleSigningComplete
  const handleSigningComplete = useCallback(() => {
    setFileSigningModal(false);
    setSelectedFileForSigning(null);
    fetchFiles();
  }, [fetchFiles]);

  // Memoize modal close handlers
  const handleUploadModalClose = useCallback(() => {
    setUploadFileModal(false);
    setDroppedFiles(null);
  }, []);

  const handleSignatureModalClose = useCallback(() => {
    setSignatureModal(false);
  }, []);

  const handleFileSigningModalClose = useCallback(() => {
    setFileSigningModal(false);
    setSelectedFileForSigning(null);
  }, []);

  return (
    <div
      className={`relative min-h-screen transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-100' 
          : 'bg-gray-100'
      } ${dragActive ? "ring-4 ring-blue-400 ring-opacity-50" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className="max-w-[100vw] mx-auto px-2 lg:px-4 py-8">
        {/* Header Section */}
        <div className="mb-4">
          <StorageHeader
            usedStorage={usedStorage}
            percentUsed={percentUsed}
            onUploadClick={() => setUploadFileModal(true)}
            onSignatureClick={() => setSignatureModal(true)}
            formatBytes={formatBytes}
            t={t}
          />
        </div>

        {/* Search and Sort */}
        <div className="mb-4">
          <StorageSearchSort
            search={search}
            setSearch={setSearch}
            sortBy={sortBy}
            setSortBy={setSortBy}
            t={t}
          />
        </div>

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
          fetchFiles={fetchFiles}
          t={t}
        />
      </div>

      {dragActive && <StorageDragOverlay />}

      {/* Render Modals using React Portal - UPDATED TO MATCH TASK FORM STYLE */}
      {typeof window !== 'undefined' && (
        <>
          {uploadFileModal && createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-0 max-w-4xl w-full mx-4 max-h-[90vh] relative animate-fadeIn">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
                  onClick={handleUploadModalClose}
                  aria-label="Close upload modal"
                >
                  ×
                </button>
                <FileUploadModal
                  open={uploadFileModal}
                  onClose={handleUploadModalClose}
                  droppedFiles={droppedFiles}
                  onUploadSuccess={handleUploadModalClose}
                />
              </div>
            </div>,
            document.body
          )}
          
          {signatureModal && createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-0 max-w-4xl w-full mx-4 max-h-[90vh] relative animate-fadeIn overflow-hidden">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
                  onClick={handleSignatureModalClose}
                  aria-label="Close signature modal"
                >
                  ×
                </button>
                <SignatureModal
                  isOpen={signatureModal}
                  onClose={handleSignatureModalClose}
                  onSignatureSelect={() => {}}
                />
              </div>
            </div>,
            document.body
          )}
          
          {fileSigningModal && createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-0 max-w-7xl w-full mx-4 max-h-[90vh] relative animate-fadeIn">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
                  onClick={handleFileSigningModalClose}
                  aria-label="Close signing modal"
                >
                  ×
                </button>
                <FileSigningModal
                  isOpen={fileSigningModal}
                  onClose={handleFileSigningModalClose}
                  file={
                    selectedFileForSigning && selectedFileForSigning.fileLocation && selectedFileForSigning.fileType
                      ? {
                          _id: selectedFileForSigning._id,
                          fileName: selectedFileForSigning.fileName,
                          fileLocation: selectedFileForSigning.fileLocation,
                          fileType: selectedFileForSigning.fileType,
                        }
                      : null
                  }
                  onSigningComplete={handleSigningComplete}
                />
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

Storage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default React.memo(Storage);
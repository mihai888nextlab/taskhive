import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB

export type FileType = {
  _id: string;
  fileName: string;
  fileSize: number;
  fileLocation?: string;
  fileType?: string;
};

export function useStorage() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [uploadFileModal, setUploadFileModal] = useState<boolean>(false);
  const [signatureModal, setSignatureModal] = useState<boolean>(false);
  const [fileSigningModal, setFileSigningModal] = useState<boolean>(false);
  const [selectedFileForSigning, setSelectedFileForSigning] = useState<FileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'size'>('name');
  const [droppedFiles, setDroppedFiles] = useState<FileList | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const t = useTranslations("StoragePage");

  const percentUsed = useMemo(() => Math.min((usedStorage / MAX_STORAGE_BYTES) * 100, 100), [usedStorage]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/getFiles");
      const data = await res.json();
      if (res.ok && Array.isArray(data.files)) {
        setFiles(data.files);
        const total = data.files.reduce((sum: number, file: FileType) => sum + (file.fileSize || 0), 0);
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

  const filteredFiles = useMemo(() => (
    files.filter(f => f.fileName.toLowerCase().includes(search.toLowerCase()))
  ), [files, search]);

  const sortedFiles = useMemo(() => {
    const arr = [...filteredFiles];
    if (sortBy === "name") return arr.sort((a, b) => a.fileName.localeCompare(b.fileName));
    if (sortBy === "size") return arr.sort((a, b) => b.fileSize - a.fileSize);
    return arr;
  }, [filteredFiles, sortBy]);

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

  const handleSignFile = useCallback((file: FileType) => {
    setSelectedFileForSigning(file);
    setFileSigningModal(true);
  }, []);

  const handleSigningComplete = useCallback(() => {
    setFileSigningModal(false);
    setSelectedFileForSigning(null);
    fetchFiles();
  }, [fetchFiles]);

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

  return {
    files,
    usedStorage,
    percentUsed,
    uploadFileModal,
    setUploadFileModal,
    signatureModal,
    setSignatureModal,
    fileSigningModal,
    setFileSigningModal,
    selectedFileForSigning,
    setSelectedFileForSigning,
    loading,
    dragActive,
    setDragActive,
    search,
    setSearch,
    sortBy,
    setSortBy,
    droppedFiles,
    setDroppedFiles,
    renamingId,
    setRenamingId,
    renameValue,
    setRenameValue,
    t,
    fetchFiles,
    handleDrag,
    handleDrop,
    filteredFiles,
    sortedFiles,
    handleDelete,
    handleRename,
    handleSignFile,
    handleSigningComplete,
    handleUploadModalClose,
    handleSignatureModalClose,
    handleFileSigningModalClose,
  };
}

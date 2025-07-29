import DashboardLayout from "@/components/sidebar/DashboardLayout";
import FileUploadModal from "@/components/storage/StorageFileUploadModal";
import StorageHeader from "@/components/storage/StorageHeader";
import StorageSearchSort from "@/components/storage/StorageSearchSort";
import StorageFileList from "@/components/storage/StorageFileList";
import StorageDragOverlay from "@/components/storage/StorageDragOverlay";
import SignatureModal from "@/components/signature/SignatureModal";
import FileSigningModal from "@/components/signature/FileSigningModal";
import React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/components/ThemeContext';
import { useStorage } from '@/hooks/useStorage';
import { FaFile, FaFileImage, FaFilePdf, FaFileArchive, FaFileAlt } from 'react-icons/fa';

const Storage: React.FC = () => {
  const { theme } = useTheme();
  const {
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
    sortedFiles,
    handleDelete,
    handleRename,
    handleSignFile,
    handleSigningComplete,
    handleUploadModalClose,
    handleSignatureModalClose,
    handleFileSigningModalClose,
  } = useStorage();

  const getFileIcon = (fileName: string): React.ReactElement => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(ext || "")) return <FaFileImage className="text-blue-400" />;
    if (["pdf"].includes(ext || "")) return <FaFilePdf className="text-red-500" />;
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return <FaFileArchive className="text-yellow-500" />;
    if (["txt", "md", "doc", "docx"].includes(ext || "")) return <FaFileAlt className="text-gray-500" />;
    return <FaFile />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " B";
  };

  return (
    <div
      className={`relative min-h-screen transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-gray-100'
      } ${dragActive ? "ring-4 ring-blue-400 ring-opacity-50" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className="max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-8 w-full">
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

      {typeof window !== 'undefined' && (
        <>
          {uploadFileModal && createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) handleUploadModalClose(); }}
            >
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
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) handleSignatureModalClose(); }}
            >
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
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) handleFileSigningModalClose(); }}
            >
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
};

// @ts-ignore
Storage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default React.memo(Storage);
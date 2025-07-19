import React, { useState, useEffect, useCallback } from "react";
import { FaCloudUploadAlt, FaTimes, FaFile, FaImage } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  droppedFiles?: FileList | null;
  onUploadSuccess?: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = React.memo(
  ({ open, onClose, droppedFiles, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const t = useTranslations("StoragePage");

    useEffect(() => {
      if (droppedFiles && droppedFiles.length > 0) {
        setFile(droppedFiles[0]);
        setPreview(URL.createObjectURL(droppedFiles[0]));
      }
    }, [droppedFiles]);

    if (!open) return null;

    // Memoize file change handler
    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      },
      []
    );

    // Memoize upload handler
    const handleUpload = useCallback(async () => {
      if (!file) return alert("Please select a file!");

      setUploading(true);
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) {
          setUploading(false);
          return alert("Error reading file!");
        }

        const res = await fetch("/api/s3-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64,
            fileName: file.name,
            fileType: file.type,
          }),
        });

        const data = await res.json();
        setUploading(false);

        if (res.ok) {
          setUploadedUrl(data.url);
          if (onUploadSuccess) onUploadSuccess();
        } else {
          alert("Upload error: " + data.error);
        }
      };
    }, [file, onUploadSuccess]);

    // Memoize close handler
    const handleClose = useCallback(() => {
      setFile(null);
      setPreview(null);
      setUploadedUrl(null);
      onClose();
    }, [onClose]);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop with blur */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl max-w-full sm:max-w-md w-full border border-white/20 mx-2 dark:bg-gray-900/95 dark:border-gray-700">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-blue-100 rounded-xl dark:bg-blue-900">
                <FaCloudUploadAlt className="text-lg sm:text-xl text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">
                  {t("uploadFile")}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {t("chooseFileToUpload")}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 mt-2 sm:mt-0 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            >
              <FaTimes className="text-base sm:text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* File Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                {t("selectFile")}
              </label>
              <input
                type="file"
                accept="*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200 dark:text-gray-300 dark:file:bg-blue-950 dark:file:text-blue-300 dark:hover:file:bg-blue-900"
              />
            </div>

            {/* File Preview */}
            {preview && file && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200/50 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-950">
                        <FaFile className="text-2xl text-blue-600 dark:text-blue-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadedUrl && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl dark:bg-green-900/30 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900">
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      {t("uploadSuccessful")}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      {t("fileUploadedSuccessfully")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                !file || uploading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900"
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin dark:border-gray-700 dark:border-t-blue-400" />
                  {t("uploading")}
                </div>
              ) : (
                t("uploadFile")
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default React.memo(FileUploadModal);
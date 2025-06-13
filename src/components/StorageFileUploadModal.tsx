import { useState } from "react";
import FileCard from "./StorageFileCard";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FileUploadModal({
  open,
  onClose,
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  if (!open) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return alert("Selectează un fișier!");

    setUploading(true);
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (!base64) {
        setUploading(false);
        return alert("Eroare la citirea fișierului!");
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
      } else {
        alert("Eroare la upload: " + data.error);
      }
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-6 max-w-md w-full rounded-lg shadow-lg relative">
        <button
          onClick={() => {
            setFile(null);
            setPreview(null);
            setUploadedUrl(null);
            onClose();
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Upload File</h2>
        <input
          type="file"
          accept="*"
          onChange={handleFileChange}
          className="block w-full border p-2 mb-2"
        />

        {preview && file && uploadedUrl && (
          <FileCard
            fileName={file.name}
            fileSize={file.size}
            downloadUrl={uploadedUrl}
          />
        )}

        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full mt-3"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* {uploadedUrl && (
          <div className="mt-3">
            <p className="text-green-500">✅ Upload reușit!</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Vezi fișierul
            </a>
          </div>
        )} */}
      </div>
    </div>
  );
}

import React from "react";

interface StorageHeaderProps {
  usedStorage: number;
  percentUsed: number;
  onUploadClick: () => void;
  formatBytes: (bytes: number) => string;
}

const StorageHeader: React.FC<StorageHeaderProps> = ({
  usedStorage,
  percentUsed,
  onUploadClick,
  formatBytes,
}) => (
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
      onClick={onUploadClick}
    >
      Upload File
    </button>
  </div>
);

export default StorageHeader;
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
  <div className="w-full max-w-lg sm:max-w-2/3 mx-auto">
    <div className="mb-2 flex flex-col sm:flex-row justify-between text-xs sm:text-sm font-medium gap-1 sm:gap-0">
      <span>{formatBytes(usedStorage)} used</span>
      <span>{percentUsed.toFixed(1)}% of 1 GB</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-4 sm:h-6 overflow-hidden mb-4 sm:mb-6">
      <div
        className="bg-primary h-4 sm:h-6 rounded-full transition-all duration-500"
        style={{ width: `${percentUsed}%` }}
      ></div>
    </div>
    <button
      className="bg-primary text-white w-full sm:w-auto px-4 sm:px-6 py-2 rounded-xl font-semibold shadow hover:bg-primary-dark transition text-base sm:text-lg"
      onClick={onUploadClick}
    >
      Upload File
    </button>
  </div>
);

export default StorageHeader;
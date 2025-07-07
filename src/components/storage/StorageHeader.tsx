import React from "react";
import { FaCloudUploadAlt, FaHdd, FaSignature } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface StorageHeaderProps {
  usedStorage: number;
  percentUsed: number;
  onUploadClick: () => void;
  onSignatureClick: () => void;
  formatBytes: (bytes: number) => string;
}

const StorageHeader: React.FC<StorageHeaderProps> = ({
  usedStorage,
  percentUsed,
  onUploadClick,
  onSignatureClick,
  formatBytes,
}) => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl px-6 pt-6 pb-3 border border-gray-200/50">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-blue-100 rounded-xl">
        <FaHdd className="text-2xl text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Storage Usage</h3>
        <p className="text-sm text-gray-600">
          Monitor your file storage consumption
        </p>
      </div>
      <div className="ml-auto flex gap-2">
        <Button
          onClick={onSignatureClick}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transform hover:scale-102 transition-all duration-200"
          variant="default"
        >
          <FaSignature className="text-lg" />
          <span className="font-medium">Manage Signatures</span>
        </Button>
        <Button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-800 transition-all duration-200"
          variant="default"
        >
          <FaCloudUploadAlt className="text-lg" />
          <span className="font-medium">Upload Files</span>
        </Button>
      </div>
    </div>

    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {formatBytes(usedStorage)} used
        </span>
        <span className="text-sm font-medium text-gray-700">
          {percentUsed.toFixed(1)}% of 1 GB
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            percentUsed < 50
              ? "bg-gradient-to-r from-green-400 to-green-500"
              : percentUsed < 80
              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
              : "bg-gradient-to-r from-red-400 to-red-500"
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
    </div>
  </div>
);

export default StorageHeader;
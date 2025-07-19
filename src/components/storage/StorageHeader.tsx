import React, { useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
import { FaCloudUploadAlt, FaHdd, FaSignature } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface StorageHeaderProps {
  usedStorage: number;
  percentUsed: number;
  onUploadClick: () => void;
  onSignatureClick: () => void;
  formatBytes: (bytes: number) => string;
  t: ReturnType<typeof useTranslations>;
}

const StorageHeader: React.FC<StorageHeaderProps> = React.memo(
  ({
    usedStorage,
    percentUsed,
    onUploadClick,
    onSignatureClick,
    formatBytes,
    t,
  }) => {
    // Memoize upload and signature click handlers
    const handleUploadClick = useCallback(() => {
      onUploadClick();
    }, [onUploadClick]);
    const handleSignatureClick = useCallback(() => {
      onSignatureClick();
    }, [onSignatureClick]);

    const { theme } = useTheme();
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/80 border-gray-200/50'} backdrop-blur-md rounded-2xl px-2 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-3 border w-full max-w-full overflow-x-auto`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 w-full max-w-full">
          <div className={`p-2 sm:p-3 ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} rounded-xl flex-shrink-0`}>
            <FaHdd className={`text-xl sm:text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t("storageUsage")}</h3>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t("monitorStorage")}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 max-w-full overflow-x-auto">
            <Button
              onClick={handleSignatureClick}
              className={`flex-1 flex items-center justify-center gap-1 px-2 sm:px-6 py-1.5 sm:py-3 rounded-xl text-xs sm:text-base min-h-0 h-8 sm:h-auto ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-700'} transform hover:scale-102 transition-all duration-200`}
              style={{ minWidth: 0 }}
              variant="default"
            >
              <FaSignature className="text-sm sm:text-lg" />
              <span className="font-medium hidden xs:inline">{t("manageSignatures")}</span>
            </Button>
            <Button
              onClick={handleUploadClick}
              className={`flex-1 flex items-center justify-center gap-1 px-2 sm:px-6 py-1.5 sm:py-3 rounded-xl text-xs sm:text-base min-h-0 h-8 sm:h-auto ${theme === 'dark' ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-800'} transition-all duration-200`}
              style={{ minWidth: 0 }}
              variant="default"
            >
              <FaCloudUploadAlt className="text-sm sm:text-lg" />
              <span className="font-medium hidden xs:inline">{t("uploadFiles")}</span>
            </Button>
          </div>
        </div>

        <div className="mb-4 w-full">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-2 gap-1 xs:gap-0 w-full">
            <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t("used", { used: formatBytes(usedStorage) })}</span>
            <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t("percentOfGB", { percent: percentUsed.toFixed(1) })}</span>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} w-full rounded-full h-2 sm:h-3 overflow-hidden`}>
            <div
              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
                percentUsed < 50
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : percentUsed < 80
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default React.memo(StorageHeader);
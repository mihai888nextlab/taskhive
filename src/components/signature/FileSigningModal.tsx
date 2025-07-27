import React, { useState, useRef, useCallback, useMemo } from 'react';
import { FaTimes, FaPencilAlt, FaMousePointer, FaExpandArrowsAlt, FaDownload, FaFileSignature, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import SignatureModal from './SignatureModal';
import { useTranslations } from "next-intl";

interface FileSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    _id: string;
    fileName: string;
    fileLocation: string;
    fileType: string;
  } | null;
  onSigningComplete?: () => void;
}

const FileSigningModal: React.FC<FileSigningModalProps> = ({
  isOpen,
  onClose,
  file,
  onSigningComplete,
}) => {
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [signaturePosition, setSignaturePosition] = useState<{ x: number; y: number } | null>(null);
  const [signatureSize, setSignatureSize] = useState<{ width: number; height: number }>({ width: 200, height: 100 });
  const [signing, setSigning] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [contentDimensions, setContentDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isPlacingSignature, setIsPlacingSignature] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'place'>('select');
  const [saveOption, setSaveOption] = useState<'new' | 'replace'>('new'); // New state for save option
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const t = useTranslations("Signature");
  const { theme } = require("@/components/ThemeContext");

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSignature || !previewRef.current) return;

    const isImageFile = !!file?.fileType && file.fileType.startsWith('image/');
    const isPdfFile = file?.fileType === 'application/pdf';

    if (!isImageFile && !isPdfFile) return;

    const rect = previewRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    if (isImageFile) {
      // Handle image files
      const img = previewRef.current.querySelector('img');
      if (img) {
        setContentDimensions({ 
          width: img.naturalWidth, 
          height: img.naturalHeight 
        });
      }
      
      // For full-width view, use direct coordinates
      const normalizedX = clickX / rect.width;
      const normalizedY = clickY / rect.height;
      
      setSignaturePosition({ 
        x: normalizedX, 
        y: normalizedY 
      });
    } else if (isPdfFile && iframeRef.current) {
      // For PDFs in full view, use direct iframe coordinates
      console.log('PDF click detected at position:', { clickX, clickY });
      
      // Store the iframe dimensions - this represents the full PDF view
      setContentDimensions({ 
        width: rect.width, 
        height: rect.height 
      });
      
      // Calculate normalized position within the full iframe
      const normalizedX = clickX / rect.width;
      const normalizedY = clickY / rect.height;
      
      setSignaturePosition({ 
        x: normalizedX, 
        y: normalizedY 
      });
      
      console.log('PDF signature positioned:', {
        fullViewSize: { width: rect.width, height: rect.height },
        clickCoordinates: { x: clickX, y: clickY },
        normalizedPosition: { x: normalizedX, y: normalizedY }
      });
    }
  };

  const getSignatureDisplayPosition = () => {
    if (!signaturePosition || !previewRef.current || !contentDimensions) return null;
    
    const rect = previewRef.current.getBoundingClientRect();
    
    // For full-width view, position directly based on normalized coordinates
    const pixelX = signaturePosition.x * rect.width;
    const pixelY = signaturePosition.y * rect.height;
    
    return { x: pixelX, y: pixelY };
  };

  // Memoize signature select handler
  const handleSignatureSelect = useCallback((signatureUrl: string) => {
    setSelectedSignature(signatureUrl);
    setShowSignatureModal(false);
    // Move to placement step
    setCurrentStep('place');
    setIsPlacingSignature(true);
  }, []);

  // Memoize go back handler
  const goBackToSelection = useCallback(() => {
    setCurrentStep('select');
    setSignaturePosition(null);
    setIsPlacingSignature(false);
  }, []);

  // Memoize signFile handler
  const signFile = useCallback(async () => {
    if (!selectedSignature || !file || !previewRef.current || !signaturePosition || !contentDimensions) return;

    setSigning(true);
    try {
      const pixelPosition = {
        x: signaturePosition.x * contentDimensions.width,
        y: signaturePosition.y * contentDimensions.height
      };

      const requestBody = {
        fileId: file._id,
        signatureUrl: selectedSignature,
        signatureSize: signatureSize,
        clickPosition: pixelPosition,
        previewDimensions: contentDimensions,
        fileType: file.fileType,
        saveOption: saveOption // Add save option to request
      };
      
      console.log('Sending signature request:', requestBody);

      const res = await fetch('/api/sign-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const result = await res.json();
        setSelectedSignature(null);
        setSignaturePosition(null);
        setSignatureSize({ width: 200, height: 100 });
        setContentDimensions(null);
        setCurrentStep('select');
        setSaveOption('new');
        
        if (onSigningComplete) {
          onSigningComplete();
        }
        
        onClose();
        
        if (saveOption === 'new') {
          alert('New signed copy created successfully!');
        } else {
          alert('File signed and updated successfully!');
        }
      } else {
        const errorData = await res.json();
        alert(`Failed to sign file: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Signing error:', error);
      alert('Failed to sign file: Network error');
    } finally {
      setSigning(false);
    }
  }, [selectedSignature, file, previewRef, signaturePosition, contentDimensions, signatureSize, saveOption, onSigningComplete, onClose]);

  // Memoize modal close handler
  const handleSignatureModalClose = useCallback(() => {
    setShowSignatureModal(false);
  }, []);

  if (!isOpen || !file) return null;

  // Handler for backdrop click
  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isImageFile = !!file.fileType && file.fileType.startsWith('image/');
  const isPdfFile = file.fileType === 'application/pdf';
  const canSign = selectedSignature && signaturePosition;
  const displayPosition = getSignatureDisplayPosition();

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm`}
          onClick={handleClose}
        >
          <div
            className={`rounded-3xl shadow-xl w-[95vw] h-[95vh] relative overflow-hidden flex flex-col border ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            {/* Close Button and Header remain the same */}
            <button
              className={`absolute top-3 right-3 z-10 p-1 text-xl ${theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              onClick={onClose}
              aria-label={t("cancel")}
            >
              <FaTimes />
            </button>

            <div className={`px-6 py-4 border-b flex-shrink-0 rounded-t-3xl ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FaFileSignature className="text-sm text-white" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("signDocument")}</h2>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{file.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === 'select'
                      ? 'bg-blue-600 text-white'
                      : theme === "dark"
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className={`w-8 h-px ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === 'place'
                      ? 'bg-blue-600 text-white'
                      : theme === "dark"
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                </div>
              </div>
            </div>
            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {currentStep === 'select' ? (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="max-w-lg w-full space-y-6">
                    <div className="text-center">
                      <h3 className={`text-xl font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("chooseSignature")}</h3>
                      <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{t("selectSignatureToSign")}</p>
                    </div>
                    {/* Signature Display */}
                    <div className={`rounded-xl p-6 min-h-[120px] flex items-center justify-center border ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                      {selectedSignature ? (
                        <div className="text-center">
                          <img
                            src={selectedSignature}
                            alt="Selected signature"
                            className="max-w-full max-h-[80px] object-contain mx-auto mb-2"
                          />
                          <p className="text-sm text-blue-600 font-medium">{t("signatureSelected")}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
                            <FaPencilAlt className={theme === "dark" ? "text-gray-500" : "text-gray-400"} />
                          </div>
                          <p className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>{t("noSignatureSelected")}</p>
                        </div>
                      )}
                    </div>
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className={`w-full px-4 py-3 rounded-xl font-medium transition-colors ${theme === "dark" ? "bg-blue-700 text-white hover:bg-blue-900" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                      >
                        {selectedSignature ? t("changeSignature") : t("selectSignatureTab")}
                      </button>
                      {selectedSignature && (
                        <button
                          onClick={() => {
                            setCurrentStep('place');
                            setIsPlacingSignature(true);
                          }}
                          className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border ${theme === "dark" ? "border-gray-700 text-gray-200 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                        >
                          {t("continueToPlacement")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex">
                  {/* File Preview */}
                  <div className="flex-1 flex flex-col">
                    {/* Preview Header */}
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
                      <button
                        onClick={goBackToSelection}
                        className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${theme === "dark" ? "text-gray-200 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                      >
                        <FaArrowLeft className="text-xs" />
                        {t("back")}
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                          {signaturePosition ? t("clickToReposition") : t("clickToPlaceSignature")}
                        </span>
                      </div>
                    </div>
                    {/* Document Preview */}
                    <div className={`flex-1 relative ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
                      <div 
                        ref={previewRef}
                        className="w-full h-full relative overflow-auto cursor-crosshair"
                      >
                        {isImageFile ? (
                          <img
                            src={file.fileLocation}
                            alt={file.fileName}
                            className="w-full h-full object-contain"
                            onClick={handlePreviewClick}
                          />
                        ) : isPdfFile ? (
                          <div className="relative w-full h-full">
                            <iframe
                              ref={iframeRef}
                              src={`${file.fileLocation}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-fit&view=FitH&pagemode=none`}
                              className="w-full h-full border-0"
                              title={file.fileName}
                              style={{
                                border: 'none',
                                outline: 'none',
                                backgroundColor: theme === "dark" ? "#1a202c" : "white",
                                pointerEvents: 'none'
                              }}
                              allow="fullscreen"
                            />
                            <div 
                              className="absolute inset-0 bg-transparent"
                              onClick={handlePreviewClick}
                            >
                              {!signaturePosition && (
                                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm pointer-events-none ${theme === "dark" ? "bg-blue-900 text-white" : "bg-blue-600 text-white"}`}>
                                  {t("clickToPlaceSignature")}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>{t("previewNotAvailable")}</p>
                          </div>
                        )}
                        {/* Signature Preview */}
                        {selectedSignature && signaturePosition && displayPosition && (
                          <div
                            className={`absolute pointer-events-none border flex items-center justify-center rounded ${theme === "dark" ? "border-blue-400 bg-blue-900/30" : "border-blue-400 bg-blue-50/30"}`}
                            style={{
                              left: `${displayPosition.x - signatureSize.width / 2}px`,
                              top: `${displayPosition.y - signatureSize.height / 2}px`,
                              width: `${signatureSize.width}px`,
                              height: `${signatureSize.height}px`,
                              zIndex: 10,
                            }}
                          >
                            <img
                              src={selectedSignature}
                              alt="Signature preview"
                              className="w-full h-full object-contain opacity-90"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Controls Sidebar */}
                  <div className={`w-72 border-l p-4 space-y-4 overflow-y-auto ${theme === "dark" ? "border-gray-700 bg-gray-900 text-white" : "border-gray-100 bg-white text-gray-900"}`}>
                    {/* Selected Signature */}
                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("signatureTab")}</h4>
                      <div className={`rounded-xl p-3 flex items-center justify-center border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                        <img
                          src={selectedSignature ?? ''}
                          alt="Selected signature"
                          className="max-w-full max-h-[60px] object-contain"
                        />
                      </div>
                    </div>
                    {/* Save Option Selection */}
                    <div>
                      <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("saveOptions")}</h4>
                      <div className="space-y-2">
                        <label className={`flex items-start p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${theme === "dark" ? "border-gray-700 hover:border-blue-400" : "border-gray-200 hover:border-blue-300"}`}>
                          <input
                            type="radio"
                            name="saveOption"
                            value="new"
                            checked={saveOption === 'new'}
                            onChange={(e) => setSaveOption(e.target.value as 'new' | 'replace')}
                            className={`w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5 ${theme === "dark" ? "border-gray-600 bg-gray-900" : "border-gray-300 bg-white"}`}
                          />
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("createNewCopy")}</p>
                            <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{t("keepOriginalCreateSignedCopy")}</p>
                          </div>
                        </label>
                        <label className={`flex items-start p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${theme === "dark" ? "border-gray-700 hover:border-blue-400" : "border-gray-200 hover:border-blue-300"}`}>
                          <input
                            type="radio"
                            name="saveOption"
                            value="replace"
                            checked={saveOption === 'replace'}
                            onChange={(e) => setSaveOption(e.target.value as 'new' | 'replace')}
                            className={`w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5 ${theme === "dark" ? "border-gray-600 bg-gray-900" : "border-gray-300 bg-white"}`}
                          />
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("replaceOriginal")}</p>
                            <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{t("overwriteWithSignedVersion")}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    {/* Size Controls */}
                    <div>
                      <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("size")}</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{t("width", { default: "Width" })}</span>
                            <span className={`text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>{signatureSize.width}px</span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="500"
                            value={signatureSize.width}
                            onChange={(e) => {
                              const width = parseInt(e.target.value);
                              setSignatureSize(prev => ({ 
                                width, 
                                height: Math.round(width * 0.5)
                              }));
                            }}
                            className={`w-full h-1 rounded-full appearance-none cursor-pointer ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{t("height", { default: "Height" })}</span>
                            <span className={`text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>{signatureSize.height}px</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="250"
                            value={signatureSize.height}
                            onChange={(e) => {
                              const height = parseInt(e.target.value);
                              setSignatureSize(prev => ({ 
                                ...prev, 
                                height 
                              }));
                            }}
                            className={`w-full h-1 rounded-full appearance-none cursor-pointer ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                          />
                        </div>
                        {/* Preset Sizes */}
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { name: "S", width: 120, height: 60 },
                            { name: "M", width: 200, height: 100 },
                            { name: "L", width: 300, height: 150 },
                            { name: "XL", width: 400, height: 200 }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => setSignatureSize({ width: preset.width, height: preset.height })}
                              className={`px-2 py-1 text-xs rounded-lg transition-colors ${theme === "dark" ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Status */}
                    <div className={`pt-2 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${signaturePosition ? 'bg-green-500' : theme === "dark" ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                          {signaturePosition ? t("readyToSign") : t("positionSignature")}
                        </span>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={signFile}
                        disabled={!canSign || signing}
                        className={`w-full px-4 py-3 rounded-xl font-medium transition-colors ${
                          canSign && !signing
                            ? theme === "dark"
                              ? 'bg-blue-700 text-white hover:bg-blue-900'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                            : theme === "dark"
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {signing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-4 h-4 border rounded-full animate-spin ${theme === "dark" ? "border-gray-700 border-t-white" : "border-gray-300 border-t-white"}`}></div>
                            {t("signing")}
                          </div>
                        ) : (
                          saveOption === 'new' ? t("signAndCreateCopy") : t("signAndReplaceFile")
                        )}
                      </button>
                      <button
                        onClick={onClose}
                        className={`w-full px-4 py-2 text-sm rounded-xl transition-colors ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Signature Selection Modal */}
      {showSignatureModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className={`rounded-3xl shadow-xl p-0 max-w-3xl w-full mx-4 max-h-[80vh] relative border ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xl z-10 p-1"
              onClick={handleSignatureModalClose}
              aria-label={t("cancel")}
            >
              <FaTimes />
            </button>
            <SignatureModal
              isOpen={showSignatureModal}
              onClose={handleSignatureModalClose}
              onSignatureSelect={handleSignatureSelect}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FileSigningModal;
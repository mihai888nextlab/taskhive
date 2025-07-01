import React, { useState, useRef } from 'react';
import { FaTimes, FaPencilAlt, FaMousePointer, FaExpandArrowsAlt, FaDownload, FaFileSignature, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import SignatureModal from './SignatureModal';

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
  const [currentStep, setCurrentStep] = useState<'select' | 'place'>('select'); // New: step control
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const handleSignatureSelect = (signatureUrl: string) => {
    setSelectedSignature(signatureUrl);
    setShowSignatureModal(false);
    // Move to placement step
    setCurrentStep('place');
    setIsPlacingSignature(true);
  };

  const goBackToSelection = () => {
    setCurrentStep('select');
    setSignaturePosition(null);
    setIsPlacingSignature(false);
  };

  const signFile = async () => {
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
        fileType: file.fileType
      };
      
      console.log('Sending signature request:', requestBody);

      const res = await fetch('/api/sign-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        setSelectedSignature(null);
        setSignaturePosition(null);
        setSignatureSize({ width: 200, height: 100 });
        setContentDimensions(null);
        setCurrentStep('select');
        
        if (onSigningComplete) {
          onSigningComplete();
        }
        
        onClose();
        alert('File signed successfully!');
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
  };

  if (!isOpen || !file) return null;

  const isImageFile = !!file.fileType && file.fileType.startsWith('image/');
  const isPdfFile = file.fileType === 'application/pdf';
  const canSign = selectedSignature && signaturePosition;
  const displayPosition = getSignatureDisplayPosition();

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[95vh] relative animate-fadeIn overflow-hidden flex flex-col">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
              onClick={onClose}
              aria-label="Close file signing modal"
            >
              <FaTimes />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <FaFileSignature className="text-xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sign Document</h2>
                    <p className="text-gray-600">{file.fileName}</p>
                  </div>
                </div>
                
                {/* Step Indicator */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 'select' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'}`}>1</span>
                    <span className="font-medium">Select Signature</span>
                  </div>
                  <FaArrowRight className="text-gray-400" />
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 'place' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 'place' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>2</span>
                    <span className="font-medium">Place Signature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {currentStep === 'select' ? (
                /* Step 1: Signature Selection */
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center">
                      <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <FaPencilAlt className="text-3xl text-blue-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Signature</h3>
                      <p className="text-gray-600 text-lg">Select or create a digital signature to sign your document</p>
                    </div>

                    {/* Selected Signature Display */}
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
                      {selectedSignature ? (
                        <div className="text-center">
                          <img
                            src={selectedSignature}
                            alt="Selected signature"
                            className="max-w-full max-h-[120px] object-contain mx-auto mb-4"
                          />
                          <p className="text-green-600 font-semibold">✓ Signature Selected</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FaPencilAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium text-lg">No signature selected</p>
                          <p className="text-gray-400 text-sm">Click the button below to choose a signature</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-bold transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <FaPencilAlt />
                          {selectedSignature ? 'Change Signature' : 'Select Signature'}
                        </div>
                      </button>

                      {selectedSignature && (
                        <button
                          onClick={() => {
                            setCurrentStep('place');
                            setIsPlacingSignature(true);
                          }}
                          className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
                        >
                          <div className="flex items-center justify-center gap-3">
                            <FaArrowRight />
                            Continue to Placement
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Signature Placement */
                <div className="h-full flex">
                  {/* File Preview - Full Width */}
                  <div className="flex-1 flex flex-col">
                    {/* Preview Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={goBackToSelection}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                          <FaArrowLeft />
                          Back to Selection
                        </button>
                        <div className="flex items-center gap-2">
                          <FaMousePointer className="text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {signaturePosition ? 'Click anywhere to reposition your signature' : 'Click on the document to place your signature'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Full Document Preview */}
                    <div className="flex-1 relative bg-gray-100">
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
                                backgroundColor: 'white',
                                pointerEvents: 'none' // Always disable iframe interactions to allow our click handler
                              }}
                              allow="fullscreen"
                            />
                            
                            {/* Always show the click overlay for PDFs */}
                            <div 
                              className="absolute inset-0"
                              style={{
                                cursor: 'crosshair',
                                background: 'transparent',
                                zIndex: 5
                              }}
                              onClick={handlePreviewClick}
                            >
                              {/* Show helpful text only when no signature is placed */}
                              {!signaturePosition && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg pointer-events-none">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    Click anywhere on the document to place your signature
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <FaDownload className="text-6xl text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 text-lg">Preview not available for this file type</p>
                            </div>
                          </div>
                        )}

                        {/* Signature Preview Overlay */}
                        {selectedSignature && signaturePosition && displayPosition && (
                          <div
                            className="absolute pointer-events-none border-2 border-blue-500 bg-blue-100/50 flex items-center justify-center shadow-lg rounded-lg"
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
                              className="w-full h-full object-contain opacity-90 rounded-lg"
                            />
                            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                              Position: {(signaturePosition.x * 100).toFixed(1)}%, {(signaturePosition.y * 100).toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Signature Controls - Right Sidebar */}
                  <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 space-y-6 overflow-y-auto">
                    {/* Selected Signature */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaPencilAlt className="text-purple-600" />
                        Selected Signature
                      </h4>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-center">
                        <img
                          src={selectedSignature ?? ''}
                          alt="Selected signature"
                          className="max-w-full max-h-[80px] object-contain"
                        />
                      </div>
                    </div>

                    {/* Signature Size Controls */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                        <FaExpandArrowsAlt className="text-purple-600" />
                        Signature Size
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Width: {signatureSize.width}px
                          </label>
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
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Height: {signatureSize.height}px
                          </label>
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
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Preset sizes */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: "Small", width: 120, height: 60 },
                            { name: "Medium", width: 200, height: 100 },
                            { name: "Large", width: 300, height: 150 },
                            { name: "X-Large", width: 400, height: 200 }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => setSignatureSize({ width: preset.width, height: preset.height })}
                              className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Position Info */}
                    {signaturePosition && contentDimensions && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-2">Signature Position</h4>
                        <p className="text-green-700 text-sm">
                          X: {(signaturePosition.x * 100).toFixed(1)}%
                        </p>
                        <p className="text-green-700 text-sm">
                          Y: {(signaturePosition.y * 100).toFixed(1)}%
                        </p>
                        <p className="text-green-600 text-xs mt-2">
                          Document: {contentDimensions.width} × {contentDimensions.height}px
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold mb-3 text-gray-900">Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-sm font-medium">Signature selected</span>
                        </div>
                        <div className={`flex items-center gap-2 ${signaturePosition ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${signaturePosition ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <span className="text-white text-xs">{signaturePosition ? '✓' : '2'}</span>
                          </div>
                          <span className="text-sm font-medium">Position selected</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={signFile}
                        disabled={!canSign || signing}
                        className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                          canSign && !signing
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {signing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                            Signing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <FaFileSignature />
                            Sign Document
                          </div>
                        )}
                      </button>
                      
                      <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                      >
                        Cancel
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-0 max-w-4xl w-full mx-4 max-h-[90vh] relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
              onClick={() => setShowSignatureModal(false)}
              aria-label="Close signature selection"
            >
              ×
            </button>
            <SignatureModal
              isOpen={showSignatureModal}
              onClose={() => setShowSignatureModal(false)}
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
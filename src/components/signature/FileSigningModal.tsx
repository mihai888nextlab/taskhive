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
  const [currentStep, setCurrentStep] = useState<'select' | 'place'>('select');
  const [saveOption, setSaveOption] = useState<'new' | 'replace'>('new'); // New state for save option
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
  };

  if (!isOpen || !file) return null;

  const isImageFile = !!file.fileType && file.fileType.startsWith('image/');
  const isPdfFile = file.fileType === 'application/pdf';
  const canSign = selectedSignature && signaturePosition;
  const displayPosition = getSignatureDisplayPosition();

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-[95vw] h-[95vh] relative overflow-hidden flex flex-col">
            {/* Close Button and Header remain the same */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl z-10 p-1"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0 rounded-t-3xl bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FaFileSignature className="text-sm text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Sign Document</h2>
                    <p className="text-sm text-gray-500">{file.fileName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className="w-8 h-px bg-gray-200"></div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === 'place' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {currentStep === 'select' ? (
                /* Step 1: Signature Selection Only */
                <div className="h-full flex items-center justify-center p-8">
                  <div className="max-w-lg w-full space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Choose Signature</h3>
                      <p className="text-gray-500">Select a signature to sign your document</p>
                    </div>

                    {/* Signature Display */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 min-h-[120px] flex items-center justify-center">
                      {selectedSignature ? (
                        <div className="text-center">
                          <img
                            src={selectedSignature}
                            alt="Selected signature"
                            className="max-w-full max-h-[80px] object-contain mx-auto mb-2"
                          />
                          <p className="text-sm text-blue-600 font-medium">Signature selected</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FaPencilAlt className="text-gray-400" />
                          </div>
                          <p className="text-gray-400">No signature selected</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        {selectedSignature ? 'Change Signature' : 'Select Signature'}
                      </button>

                      {selectedSignature && (
                        <button
                          onClick={() => {
                            setCurrentStep('place');
                            setIsPlacingSignature(true);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                          Continue to Placement
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Signature Placement with Save Options */
                <div className="h-full flex">
                  {/* File Preview */}
                  <div className="flex-1 flex flex-col">
                    {/* Preview Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <button
                        onClick={goBackToSelection}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-100"
                      >
                        <FaArrowLeft className="text-xs" />
                        Back
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {signaturePosition ? 'Click to reposition' : 'Click to place signature'}
                        </span>
                      </div>
                    </div>

                    {/* Document Preview */}
                    <div className="flex-1 relative bg-gray-50">
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
                                pointerEvents: 'none'
                              }}
                              allow="fullscreen"
                            />
                            
                            <div 
                              className="absolute inset-0 bg-transparent"
                              onClick={handlePreviewClick}
                            >
                              {!signaturePosition && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
                                  Click to place signature
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Preview not available</p>
                          </div>
                        )}

                        {/* Signature Preview */}
                        {selectedSignature && signaturePosition && displayPosition && (
                          <div
                            className="absolute pointer-events-none border border-blue-400 bg-blue-50/30 flex items-center justify-center rounded"
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
                  <div className="w-72 border-l border-gray-100 bg-white p-4 space-y-4 overflow-y-auto">
                    {/* Selected Signature */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Signature</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center">
                        <img
                          src={selectedSignature ?? ''}
                          alt="Selected signature"
                          className="max-w-full max-h-[60px] object-contain"
                        />
                      </div>
                    </div>

                    {/* Save Option Selection - MOVED HERE */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Save Options</h4>
                      <div className="space-y-2">
                        <label className="flex items-start p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-all duration-200">
                          <input
                            type="radio"
                            name="saveOption"
                            value="new"
                            checked={saveOption === 'new'}
                            onChange={(e) => setSaveOption(e.target.value as 'new' | 'replace')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Create New Copy</p>
                            <p className="text-xs text-gray-500 mt-0.5">Keep original file and create a signed copy</p>
                          </div>
                        </label>
                        <label className="flex items-start p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-all duration-200">
                          <input
                            type="radio"
                            name="saveOption"
                            value="replace"
                            checked={saveOption === 'replace'}
                            onChange={(e) => setSaveOption(e.target.value as 'new' | 'replace')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Replace Original</p>
                            <p className="text-xs text-gray-500 mt-0.5">Overwrite the existing file with signed version</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Size Controls */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Size</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Width</span>
                            <span className="text-xs text-gray-700">{signatureSize.width}px</span>
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
                            className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Height</span>
                            <span className="text-xs text-gray-700">{signatureSize.height}px</span>
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
                            className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
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
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${signaturePosition ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-gray-600">
                          {signaturePosition ? 'Ready to sign' : 'Position signature'}
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
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {signing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border border-gray-300 border-t-white rounded-full animate-spin"></div>
                            Signing...
                          </div>
                        ) : (
                          saveOption === 'new' ? 'Sign & Create Copy' : 'Sign & Replace File'
                        )}
                      </button>
                      
                      <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm rounded-xl hover:bg-gray-50"
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

      {/* Signature Selection Modal - unchanged */}
      {showSignatureModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl p-0 max-w-3xl w-full mx-4 max-h-[80vh] relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl z-10 p-1"
              onClick={() => setShowSignatureModal(false)}
              aria-label="Close"
            >
              <FaTimes />
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
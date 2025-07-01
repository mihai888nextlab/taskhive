import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaPencilAlt, FaSignature, FaSpinner } from 'react-icons/fa';
import SignatureCanvas from './SignatureCanvas';

interface Signature {
  _id: string;
  signatureName: string;
  signatureUrl: string;
}

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureSelect: (signatureUrl: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ 
  isOpen, 
  onClose, 
  onSignatureSelect 
}) => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [newSignature, setNewSignature] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'select'>('select');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSignatures();
    }
  }, [isOpen]);

  const fetchSignatures = async () => {
    try {
      const res = await fetch('/api/signatures');
      const data = await res.json();
      if (res.ok) {
        setSignatures(data.signatures);
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
    }
  };

  const saveSignature = async () => {
    if (!newSignature || !signatureName.trim()) {
      alert('Please create a signature and enter a name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/signature-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: newSignature,
          signatureName: signatureName.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSignatures([data.signature, ...signatures]);
        setNewSignature('');
        setSignatureName('');
        setActiveTab('select');
      } else {
        alert('Failed to save signature');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature');
    } finally {
      setLoading(false);
    }
  };

  const deleteSignature = async (id: string) => {
    if (!confirm('Delete this signature?')) return;

    try {
      const res = await fetch(`/api/signatures?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSignatures(signatures.filter(s => s._id !== id));
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <FaSignature className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Signature Manager</h2>
            <p className="text-gray-600 text-sm">Create and manage your digital signatures</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('select')}
          className={`flex-1 px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'select' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FaSignature className="text-sm" />
            Select Signature
          </div>
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'create' 
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FaPencilAlt className="text-sm" />
            Create New
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {activeTab === 'select' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Signatures</h3>
              <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-sm">
                {signatures.length} signature{signatures.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {signatures.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaPencilAlt className="text-2xl text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No signatures found</h4>
                <p className="text-gray-600 mb-6">Create your first signature to get started with document signing.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium"
                >
                  <FaPlus className="text-sm" />
                  Create Your First Signature
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {signatures.map((signature) => (
                  <div key={signature._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900 truncate text-sm">{signature.signatureName}</h4>
                      <button
                        onClick={() => deleteSignature(signature._id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                        title="Delete signature"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                    
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px] flex items-center justify-center">
                      <img
                        src={signature.signatureUrl}
                        alt={signature.signatureName}
                        className="max-w-full max-h-[60px] object-contain"
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        onSignatureSelect(signature.signatureUrl);
                        onClose();
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium transition-all duration-200 text-sm"
                    >
                      Use This Signature
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Signature</h3>
              <p className="text-gray-600">Draw your signature or type your name to create a digital signature</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Signature Name *
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter a name for your signature (e.g., 'John Doe - Formal')"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Draw Your Signature *
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <SignatureCanvas onSignatureChange={setNewSignature} />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setNewSignature('');
                    setSignatureName('');
                    setActiveTab('select');
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  disabled={loading || !newSignature || !signatureName.trim()}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    loading || !newSignature || !signatureName.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin text-sm" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaSignature className="text-sm" />
                      Save Signature
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureModal;
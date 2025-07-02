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
    <div className="w-full h-full max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FaSignature className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Signature Manager</h2>
            <p className="text-gray-600 text-sm">Create and manage your digital signatures</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('select')}
          className={`flex-1 px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'select' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
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
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FaPencilAlt className="text-sm" />
            Create New
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh] bg-white">
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
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaPencilAlt className="text-2xl text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No signatures found</h4>
                <p className="text-gray-600 mb-6">Create your first signature to get started with document signing.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-all duration-200 font-medium"
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
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-800 font-medium transition-all duration-200 text-sm"
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
          <div className="max-w-3xl mx-auto">
            
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full p-4 mb-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-lg"
                  placeholder="Enter a name for your signature (e.g., 'John Doe - Formal')"
                />
                <SignatureCanvas onSignatureChange={setNewSignature} />
              </div>
              
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => {
                    setNewSignature('');
                    setSignatureName('');
                    setActiveTab('select');
                  }}
                  className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 text-lg border-2 border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  disabled={loading || !newSignature || !signatureName.trim()}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 text-lg border-2 ${
                    loading || !newSignature || !signatureName.trim()
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-800 border-blue-600 hover:border-blue-800 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <FaSpinner className="animate-spin text-lg" />
                      Saving Signature...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <FaSignature className="text-lg" />
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
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from "@/components/ThemeContext";
import { FaTimes, FaPlus, FaTrash, FaPencilAlt, FaSignature, FaSpinner } from 'react-icons/fa';
import SignatureCanvas from './SignatureCanvas';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Signature");
  const { theme } = useTheme();

  // Memoize fetchSignatures
  const fetchSignatures = useCallback(async () => {
    try {
      const res = await fetch('/api/signatures');
      const data = await res.json();
      if (res.ok) {
        setSignatures(data.signatures);
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSignatures();
    }
  }, [isOpen, fetchSignatures]);

  // Memoize saveSignature
  const saveSignature = useCallback(async () => {
    if (!newSignature || !signatureName.trim()) {
      alert(t("createFirstSignature"));
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
  }, [newSignature, signatureName, signatures, t]);

  // Memoize deleteSignature
  const deleteSignature = useCallback(async (id: string) => {
    if (!confirm(t("deleteSignatureConfirm"))) return;
    try {
      const res = await fetch(`/api/signatures?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSignatures(signatures.filter(s => s._id !== id));
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
    }
  }, [signatures, t]);

  // Memoize signatures list rendering
  const signaturesList = useMemo(() => (
    signatures.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <FaPencilAlt className="text-2xl text-blue-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("noSignaturesFound")}</h4>
        <p className="text-gray-600 mb-6">{t("createFirstSignature")}</p>
        <Button
          onClick={() => setActiveTab('create')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-800 transition-all duration-200 font-medium"
        >
          <FaPlus className="text-sm" />
          {t("createYourFirstSignature")}
        </Button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signatures.map((signature) => (
          <div key={signature._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900 truncate text-sm">{signature.signatureName}</h4>
              <Button
                onClick={() => deleteSignature(signature._id)}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                title="Delete signature"
                variant="ghost"
                size="icon"
              >
                <FaTrash className="text-xs" />
              </Button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[80px] flex items-center justify-center">
              <img
                src={signature.signatureUrl}
                alt={signature.signatureName}
                className="max-w-full max-h-[60px] object-contain"
              />
            </div>
            
            <Button
              onClick={() => {
                onSignatureSelect(signature.signatureUrl);
                onClose();
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-800 font-medium transition-all duration-200 text-sm"
            >
              {t("useThisSignature")}
            </Button>
          </div>
        ))}
      </div>
    )
  ), [signatures, deleteSignature, onSignatureSelect, onClose, t]);

  if (!isOpen) return null;

  return (
    <div
      className={`w-full z-[300] h-full max-w-4xl mx-auto rounded-3xl overflow-hidden border ${
        theme === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`p-6 border-b rounded-t-3xl ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-blue-700" : "bg-blue-600"}`}>
            <FaSignature className="text-white text-lg" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("signatureManager")}</h2>
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{t("createManageSignatures")}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className={`flex border-b ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <Button
          onClick={() => setActiveTab('select')}
          className={`flex-1 px-6 py-3 font-medium transition-all duration-200 rounded-none border-0 ${
            activeTab === 'select'
              ? theme === "dark"
                ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800"
                : "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : theme === "dark"
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-blue-100"
          }`}
          variant="ghost"
        >
          <div className="flex items-center justify-center gap-2">
            <FaSignature className="text-sm" />
            {t("selectSignatureTab")}
          </div>
        </Button>
        <Button
          onClick={() => setActiveTab('create')}
          className={`flex-1 px-6 py-3 font-medium transition-all duration-200 rounded-none border-0 ${
            activeTab === 'create'
              ? theme === "dark"
                ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800"
                : "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : theme === "dark"
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-blue-100"
          }`}
          variant="ghost"
        >
          <div className="flex items-center justify-center gap-2">
            <FaPencilAlt className="text-sm" />
            {t("createNewTab")}
          </div>
        </Button>
      </div>

      {/* Content */}
      <div
        className={`p-6 overflow-y-auto max-h-[60vh] rounded-b-3xl ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {activeTab === 'select' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("yourSignatures")}</h3>
              <span className={`px-2 py-1 rounded-full text-sm ${theme === "dark" ? "text-gray-300 bg-gray-800" : "text-gray-500 bg-gray-100"}`}>
                {t("signaturesCount", { count: signatures.length })}
              </span>
            </div>

            {signatures.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-blue-900" : "bg-blue-100"}`}>
                  <FaPencilAlt className={`text-2xl ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`} />
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("noSignaturesFound")}</h4>
                <p className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{t("createFirstSignature")}</p>
                <Button
                  onClick={() => setActiveTab('create')}
                  className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-all duration-200 ${theme === "dark" ? "bg-blue-700 text-white hover:bg-blue-900" : "bg-blue-600 text-white hover:bg-blue-800"}`}
                >
                  <FaPlus className="text-sm" />
                  {t("createYourFirstSignature")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {signatures.map((signature) => (
                  <div key={signature._id} className={`border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className={`font-medium truncate text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{signature.signatureName}</h4>
                      <Button
                        onClick={() => deleteSignature(signature._id)}
                        className={`p-1 rounded transition-all duration-200 ${theme === "dark" ? "text-red-300 hover:text-red-400 hover:bg-red-900/20" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`}
                        title="Delete signature"
                        variant="ghost"
                        size="icon"
                      >
                        <FaTrash className="text-xs" />
                      </Button>
                    </div>

                    <div className={`mb-4 p-3 rounded-xl min-h-[80px] flex items-center justify-center ${theme === "dark" ? "bg-gray-900 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}>
                      <img
                        src={signature.signatureUrl}
                        alt={signature.signatureName}
                        className="max-w-full max-h-[60px] object-contain"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        onSignatureSelect(signature.signatureUrl);
                        onClose();
                      }}
                      className={`w-full py-2 rounded-xl font-medium transition-all duration-200 text-sm ${theme === "dark" ? "bg-blue-700 text-white hover:bg-blue-900" : "bg-blue-600 text-white hover:bg-blue-800"}`}
                    >
                      {t("useThisSignature")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className={`rounded-xl p-6 border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <Input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className={`w-full p-4 mb-4 border-2 rounded-xl focus:ring-2 transition-all duration-200 text-lg ${theme === "dark" ? "bg-gray-900 border-gray-700 text-white focus:ring-blue-800 focus:border-blue-800" : "border-gray-300 focus:ring-blue-600 focus:border-blue-600"}`}
                  placeholder={t("enterSignatureName")}
                />
                <SignatureCanvas onSignatureChange={setNewSignature} />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => {
                    setNewSignature('');
                    setSignatureName('');
                    setActiveTab('select');
                  }}
                  className={`flex-1 py-4 px-6 font-semibold rounded-xl transition-all duration-200 text-lg border-2 ${theme === "dark" ? "bg-gray-900 text-gray-200 hover:bg-gray-800 border-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"}`}
                  variant="ghost"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={saveSignature}
                  disabled={loading || !newSignature || !signatureName.trim()}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 text-lg border-2 ${
                    loading || !newSignature || !signatureName.trim()
                      ? theme === "dark"
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200"
                      : theme === "dark"
                        ? "bg-blue-700 text-white hover:bg-blue-900 border-blue-700 hover:border-blue-900 shadow-lg hover:shadow-xl"
                        : "bg-blue-600 text-white hover:bg-blue-800 border-blue-600 hover:border-blue-800 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <FaSpinner className="animate-spin text-lg" />
                      {t("savingSignature")}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <FaSignature className="text-lg" />
                      {t("saveSignature")}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SignatureModal);
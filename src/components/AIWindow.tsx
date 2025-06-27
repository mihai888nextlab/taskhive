import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface AIWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIWindow: React.FC<AIWindowProps> = ({ isOpen, onClose }) => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    // When pendingTranscript is set and recording has ended, submit after a delay
    if (pendingTranscript && !isRecording) {
      submitTimeoutRef.current = setTimeout(() => {
        setInputPrompt(pendingTranscript);
        handleSubmit(pendingTranscript);
        setPendingTranscript(null);
      }, 1200); // 1.2 seconds delay
    }
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
    // eslint-disable-next-line
  }, [pendingTranscript, isRecording]);

  if (!isOpen) return null;

  const handleSubmit = async (promptOverride?: string) => {
    const promptToSend = typeof promptOverride === "string" ? promptOverride : inputPrompt;
    if (!promptToSend.trim()) return;
    setChatHistory((prev) => [...prev, { type: 'user', text: promptToSend }]);
    setInputPrompt("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToSend }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to process your request. Please try again.");
      setChatHistory((prev) => [...prev, { type: 'ai', text: data.response }]);

      // Refresh if a resource was created
      if (
        response.status === 201 ||
        (data.createdTask || data.createdAnnouncement || data.createdItem)
      ) {
        setTimeout(() => {
          window.location.reload();
        }, 1200); // Give user time to see the AI response
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setChatHistory((prev) => [...prev, { type: 'ai', text: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --- Web Speech API logic ---
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => {
      setIsRecording(false);
      // Submission will be handled by useEffect when pendingTranscript is set
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPendingTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      alert("Speech recognition error: " + event.error);
    };

    recognition.start();
  };

  // Add a state to determine if the textarea is empty
  const isInputEmpty = inputPrompt.trim().length === 0;

  return (
    <div
      className="fixed z-50 animate-slide-up flex flex-col transition-all bg-gradient-to-br from-white via-blue-50 to-gray-100 shadow-2xl border border-gray-100"
      style={{
        left: 'auto',
        right: '2rem',
        bottom: '4rem',
        width: '500px',
        height: '600px',
        borderRadius: '1.25rem',
        maxWidth: '95vw',
        maxHeight: '95vh',
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .aiwindow-mobile {
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 95vh !important;
            border-radius: 1.5rem 1.5rem 0 0 !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            box-shadow: 0 -8px 32px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 #e0e7ef;
            border: none !important;
          }
        }
      `}</style>
      <div className="aiwindow-mobile flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100 bg-white/90 rounded-t-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/hive-icon.png" alt="Hive Logo" className="w-8 h-8" />
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">Hive Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-all text-2xl font-bold"
            aria-label="Close AI Assistant"
          >
            ✕
          </button>
        </div>

        {/* Chat History */}
        <div ref={chatHistoryRef} className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar bg-transparent">
          {chatHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg text-center font-medium opacity-80">
                Welcome to the <span className='text-primary font-semibold'>Hive Assistant</span>!<br/>How can I help you today?
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} className={`mb-2 px-4 py-2 rounded-2xl text-base shadow-sm max-w-[90%] ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white self-end ml-auto border border-blue-200'
                  : 'bg-white/95 border border-gray-100 text-gray-900 self-start mr-auto'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            ))
          )}
          {isLoading && (
            <div className="mb-2 px-4 py-2 rounded-2xl bg-white/95 border border-gray-100 text-gray-900 self-start mr-auto max-w-[90%] animate-pulse text-base shadow-sm">
              Thinking...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="mb-2 flex flex-col gap-2 items-stretch w-full px-3 pb-3 bg-transparent">
          <div className="flex flex-row items-center gap-2 w-full bg-white/95 rounded-full shadow-inner border border-gray-200 focus-within:border-blue-400 transition-all px-3 py-2">
            <div className="flex-1 flex items-center order-1">
              <textarea
                className="w-full h-10 p-0 px-3 bg-transparent border-none focus:outline-none text-gray-900 text-base resize-none placeholder-gray-400 font-medium tracking-tight focus:placeholder-gray-300 transition-all rounded-full shadow-none min-h-[2.5rem] max-h-[5rem]"
                style={{ boxShadow: 'none', background: 'none', border: 'none', fontFamily: 'inherit', letterSpacing: '0.01em', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                rows={1}
              ></textarea>
            </div>
            {/* Single action button (microphone or submit) on the right, always visible icons */}
            <div className="flex items-center order-2">
              <button
                onClick={isInputEmpty ? handleVoiceInput : () => handleSubmit()}
                className={`p-2 rounded-full border border-gray-200 bg-white hover:bg-blue-100 transition-all duration-200 flex items-center justify-center ${isRecording ? "animate-pulse border-blue-500" : ""} ${isInputEmpty ? '' : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 shadow-md'}`}
                disabled={isLoading}
                title={isInputEmpty ? "Record voice" : "Send"}
                style={{ minWidth: '40px', minHeight: '40px', transition: 'background 0.2s, color 0.2s' }}
              >
                {/* Only show the active icon, not both at once, with a clean fade/scale animation */}
                <span className="relative block w-6 h-6">
                  <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out
                      ${isInputEmpty ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
                    style={{ transition: 'opacity 0.3s, transform 0.3s' }}
                  >
                    {/* Microphone SVG icon - always blue */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`mx-auto text-blue-600 ${isRecording ? 'animate-pulse' : ''}`}> <rect x="9" y="2" width="6" height="12" rx="3" fill="#2563eb" stroke="none"/> <rect x="9" y="2" width="6" height="12" rx="3" fill="none"/> <path d="M5 10v2a7 7 0 0 0 14 0v-2" stroke="#2563eb" strokeWidth="2.2"/> <line x1="12" y1="22" x2="12" y2="18" stroke="#2563eb" strokeWidth="2.2"/> <line x1="8" y1="22" x2="16" y2="22" stroke="#2563eb" strokeWidth="2.2"/> </svg>
                  </span>
                  <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out
                      ${!isInputEmpty ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
                    style={{ transition: 'opacity 0.3s, transform 0.3s' }}
                  >
                    {/* Send SVG icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-4 pb-2 text-center text-xs text-gray-500 border-t border-gray-100 bg-gradient-to-r from-white/90 via-blue-50 to-white/90 rounded-b-2xl shadow-inner flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="inline-block align-middle text-blue-500"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#e0e7ef"/><path d="M8 12l2.5 2.5L16 9" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-semibold text-primary tracking-wide">Powered by Google Gemini API</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWindow;
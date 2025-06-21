import React, { useState, useRef, useEffect } from "react";

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

  return (
    <div className="fixed bottom-16 right-8 w-[500px] h-[600px] z-50 bg-white shadow-2xl rounded-xl p-6 border border-gray-300 animate-slide-up flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">AI Assistant</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 transition-all text-2xl"
          aria-label="Close AI Assistant"
        >
          ✕
        </button>
      </div>

      {/* Chat History */}
      <div ref={chatHistoryRef} className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar">
        {chatHistory.length === 0 ? (
          <p className="text-gray-600 text-lg text-center mt-4">
            Welcome to the AI Assistant! How can I help you today?
          </p>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`mb-3 p-3 rounded-lg ${
              msg.type === 'user'
                ? 'bg-blue-500 text-white self-end ml-auto max-w-[85%]'
                : 'bg-gray-100 text-gray-800 self-start mr-auto max-w-[85%]'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="mb-3 p-3 rounded-lg bg-gray-100 text-gray-800 self-start mr-auto max-w-[85%] animate-pulse">
            Thinking...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mb-4 flex gap-2 items-center">
        <textarea
          className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-gray-800"
          placeholder={isLoading ? "Waiting for response..." : "Type your question here..."}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        ></textarea>
        <button
          onClick={handleVoiceInput}
          className={`p-3 rounded-full border border-gray-300 bg-white hover:bg-blue-100 transition-all ${isRecording ? "animate-pulse border-blue-500" : ""}`}
          disabled={isLoading}
          title="Record voice"
        >
          {isRecording ? "🎤..." : "🎤"}
        </button>
      </div>
      <button
        onClick={() => handleSubmit()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Submit"}
      </button>
      <div className="mt-auto pt-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>Powered by Google Gemini API</p>
      </div>
    </div>
  );
};

export default AIWindow;
import React, { useState, useRef, useEffect } from "react";

interface AIWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIWindow: React.FC<AIWindowProps> = ({ isOpen, onClose }) => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null); // Ref for scrolling chat history

  // Scroll to bottom of chat history when it updates
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (!isOpen) return null; // Do not render if the window is closed

  const handleSubmit = async () => {
    if (!inputPrompt.trim()) return;

    const newUserMessage = { type: 'user' as const, text: inputPrompt };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setInputPrompt(""); // Clear input field

    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch response from AI.");
      }

      const data = await response.json();
      setChatHistory((prev) => [...prev, { type: 'ai', text: data.response }]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setChatHistory((prev) => [...prev, { type: 'ai', text: `Error: ${(error as Error).message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Submit on Enter, but allow Shift+Enter for new line
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-16 right-8 w-[500px] h-[600px] bg-white shadow-2xl rounded-xl p-6 border border-gray-300 animate-slide-up flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4"> {/* Adjusted margin */}
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
      <div ref={chatHistoryRef} className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar"> {/* Added custom-scrollbar class, pr-2 for scrollbar space */}
        {chatHistory.length === 0 ? (
          <p className="text-gray-600 text-lg text-center mt-4">
            Welcome to the AI Assistant! How can I help you today?
          </p>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`mb-3 p-3 rounded-lg ${
              msg.type === 'user'
                ? 'bg-blue-500 text-white self-end ml-auto max-w-[85%]' // User messages
                : 'bg-gray-100 text-gray-800 self-start mr-auto max-w-[85%]' // AI messages
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
      <div className="mb-4"> {/* Adjusted margin */}
        <textarea
          className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-gray-800"
          placeholder={isLoading ? "Waiting for response..." : "Type your question here..."}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        ></textarea>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Submit"}
      </button>

      {/* Footer */}
      <div className="mt-auto pt-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>Powered by Google Gemini API</p>
      </div>
    </div>
  );
};

export default AIWindow;
import React from "react";

interface AIWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIWindow: React.FC<AIWindowProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Do not render if the window is closed

  return (
    <div className="fixed bottom-16 right-8 w-[400px] h-[500px] bg-white shadow-2xl rounded-xl p-6 border border-gray-300 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">AI Assistant</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 transition-all text-2xl"
          aria-label="Close AI Assistant"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="text-gray-600">
        <p className="text-lg">
          Welcome to the AI Assistant! How can I help you today?
        </p>
        <div className="mt-6">
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            placeholder="Type your question here..."
          ></textarea>
        </div>
        <button
          className="mt-6 w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition-all text-lg font-medium"
        >
          Submit
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by AI API</p>
      </div>
    </div>
  );
};

export default AIWindow;
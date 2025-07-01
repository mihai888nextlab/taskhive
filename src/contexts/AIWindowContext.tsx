import React, { createContext, useContext, useState, useEffect } from 'react';

export type ChatMessage = {
  type: 'user' | 'ai';
  text: string;
};

interface AIWindowContextType {
  isAIWindowOpen: boolean;
  setIsAIWindowOpen: (open: boolean) => void;
  toggleAIWindow: () => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearChatHistory: () => void;
}

const AIWindowContext = createContext<AIWindowContextType | undefined>(undefined);

export const useAIWindow = () => {
  const context = useContext(AIWindowContext);
  if (!context) {
    throw new Error('useAIWindow must be used within an AIWindowProvider');
  }
  return context;
};

interface AIWindowProviderProps {
  children: React.ReactNode;
}

export const AIWindowProvider: React.FC<AIWindowProviderProps> = ({ children }) => {
  const [isAIWindowOpen, setIsAIWindowOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Persist AI window state and chat history in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('aiWindowOpen');
    const savedHistory = localStorage.getItem('aiChatHistory');
    
    if (savedState === 'true') {
      setIsAIWindowOpen(true);
    }
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aiWindowOpen', isAIWindowOpen.toString());
  }, [isAIWindowOpen]);

  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const toggleAIWindow = () => {
    setIsAIWindowOpen(prev => !prev);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('aiChatHistory');
  };

  return (
    <AIWindowContext.Provider value={{
      isAIWindowOpen,
      setIsAIWindowOpen,
      toggleAIWindow,
      chatHistory,
      setChatHistory,
      clearChatHistory
    }}>
      {children}
    </AIWindowContext.Provider>
  );
};

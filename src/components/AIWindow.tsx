import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTheme } from "@/components/ThemeContext";
import Image from "next/image";
import { useAIWindow } from "@/contexts/AIWindowContext";
import { useTranslations } from "next-intl";
import { FaTimes } from "react-icons/fa";

export type CommandHandlerParams = {
  input: string;
  setChatHistory: React.Dispatch<React.SetStateAction<{ type: 'user' | 'ai'; text: string }[]>>;
  setInputPrompt: React.Dispatch<React.SetStateAction<string>>;
};

type Command = {
  command: string;
  label: string;
  handler: (params: CommandHandlerParams) => Promise<void>;
};

const commands: Command[] = [
  {
    command: '/help',
    label: 'Show help',
    handler: async ({ input, setChatHistory, setInputPrompt }: CommandHandlerParams) => {
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: input },
        { type: 'ai', text: `**Hive Assistant Help**\n\nYou can use Hive Assistant to:\n\n- Create, edit, and manage tasks (e.g., \"Create a task to call John tomorrow\")\n- Add announcements (admins only)\n- Record expenses or incomes (e.g., \"Add an expense for lunch, 20 dollars, today\")\n- Get productivity and time tracking insights\n- Ask for best practices in business, organization, and team management\n- Request templates, guides, or step-by-step instructions\n- Use natural language for all requests\n\n**Commands:**\n- /help — Show this help message\n- /addtask — Start guided task creation\n- /addannouncement — Create announcement (admins)\n- /addexpense — Record an expense\n- /addincome — Record income\n- /productivity — Get productivity tips\n- /templates — Get business templates\n\nJust type your request or question!` }
      ]);
      setInputPrompt("");
    }
  },
  {
    command: '/addtask',
    label: 'Guided task creation',
    handler: async ({ input, setChatHistory, setInputPrompt }: CommandHandlerParams) => {
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: input },
        { type: 'ai', text:
`**Basic Tasks:**\n• "create task Call John tomorrow"\n• "make task Review budget by Friday"\n\n**🎯 With Auto-Subtasks:**\n• "create task **Prepare presentation** for Monday"\n• "organize team meeting next week"\n• "**develop** marketing strategy"\n• "**launch** new website"\n\n**✨ Smart Detection:**\n• AI auto-detects complex tasks needing breakdown\n• Use: "**with subtasks**", "**break it down**", "**step by step**" or just describe naturally\n• Generates 3-5 logical, actionable steps\n• All inherit deadline and assignee\n\n**Assignment:**\n• Self: "for me" or omit\n• Others: "for John Smith"\n\nJust describe naturally!` }
      ]);
      setInputPrompt("");
    }
  },
  {
    command: '/addannouncement',
    label: 'Create announcement (admins)',
    handler: async ({ input, setChatHistory, setInputPrompt }: CommandHandlerParams) => {
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: input },
        { type: 'ai', text:
`Create announcements for your organization!\n\n**Example prompts:**\n- "Create an announcement about the company meeting tomorrow"\n- "Add announcement: Holiday schedule for December"\n- "Make an announcement about new office hours, pinned, expires next Friday"\n\n**Features:**\n- Automatic categorization (Update, Meeting, Holiday, etc.)\n- Optional pinning for important announcements\n- Set expiration dates with natural language\n- Admin permissions required\n\nJust describe what announcement you want to create!` }
      ]);
      setInputPrompt("");
    }
  },
  {
    command: '/addexpense',
    label: 'Record an expense',
    handler: async ({ input, setChatHistory, setInputPrompt }: CommandHandlerParams) => {
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: input },
        { type: 'ai', text:
`Record business expenses quickly!\n\n**Example prompts:**\n- "Add expense: Office supplies, $45.99, yesterday"\n- "Record expense for client lunch, 120 dollars, Food category"\n- "Log expense: Travel to conference, $250, Transport"\n\n**Auto-categorization:**\n- Food, Transport, Utilities, Shopping, Health, General, Other\n- Amount can be in various formats ($50, 50 dollars, etc.)\n- Dates support natural language (today, yesterday, last Monday)\n\nJust describe your expense!` }
      ]);
      setInputPrompt("");
    }
  },
  {
    command: '/addincome',
    label: 'Record income',
    handler: async ({ input, setChatHistory, setInputPrompt }: CommandHandlerParams) => {
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: input },
        { type: 'ai', text:
`Track your income sources!\n\n**Example prompts:**\n- "Add income: Client payment, $2500, today"\n- "Record income from consulting, 1500 dollars, Salary category"\n- "Log income: Investment return, $300, Investment"\n\n**Categories available:**\n- Salary, Investment, General, Other\n- Multiple amount formats supported\n- Natural date parsing\n\nDescribe your income entry!` }
      ]);
      setInputPrompt("");
    }
  },
  {
    command: '/productivity',
    label: 'Get productivity tips',
    handler: async ({ input, setChatHistory, setInputPrompt }: CommandHandlerParams) => {
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: input },
        { type: 'ai', text:
`Get personalized productivity and organization advice!\n\n**Ask about:**\n- Time management strategies\n- Team collaboration best practices\n- Workflow optimization\n- Task prioritization methods\n- Meeting efficiency\n- Goal setting and tracking\n- Work-life balance\n\n**Example questions:**\n- "How to manage multiple projects effectively?"\n- "Best practices for team communication"\n- "Tips for reducing meeting fatigue"\n\nWhat productivity challenge can I help you with?` }
      ]);
      setInputPrompt("");
    }
  },
  {
    command: '/templates',
    label: 'Get business templates',
    handler: async ({ input, setChatHistory, setInputPrompt }: CommandHandlerParams) => {
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: input },
        { type: 'ai', text:
`Access business templates and guides!\n\n**Available templates:**\n- Meeting agendas and minutes\n- Project planning frameworks\n- Team role definitions\n- Communication protocols\n- Performance review templates\n- Process documentation\n- Risk assessment matrices\n\n**Example requests:**\n- "Give me a meeting agenda template"\n- "How to structure a project kickoff?"\n- "Template for quarterly team reviews"\n\nWhat type of template do you need?` }
      ]);
      setInputPrompt("");
    }
  },
];

interface AIWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop?: boolean;
  locale?: string;
}

const AIWindow: React.FC<AIWindowProps> = React.memo(({
  isOpen,
  onClose,
  isDesktop = false,
  locale,
}) => {
  const t = useTranslations("AIWindow");

  const [inputPrompt, setInputPrompt] = useState("");
  const { chatHistory, setChatHistory, clearChatHistory } = useAIWindow();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [showCommandList, setShowCommandList] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (pendingTranscript && !isRecording) {
      submitTimeoutRef.current = setTimeout(() => {
        setInputPrompt(pendingTranscript);
        handleSubmit(pendingTranscript);
        setPendingTranscript(null);
      }, 1200);
    }
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, [pendingTranscript, isRecording]);

  useEffect(() => {
    if (inputPrompt.startsWith('/')) {
      setShowCommandList(true);
      const filter = inputPrompt.slice(1).toLowerCase();
      const filtered = commands.filter(c => c.command.slice(1).startsWith(filter));
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0);
    } else {
      setShowCommandList(false);
    }
  }, [inputPrompt]);

  const { theme } = useTheme();
  const panelStyle: React.CSSProperties = useMemo(() => {
    if (isDesktop) {
      return {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        maxWidth: '32vw',
        minWidth: '340px',
        height: '100vh',
        borderRadius: '0',
        boxShadow: theme === 'dark' ? '0 0 32px 0 rgba(0,0,0,0.40)' : '0 0 32px 0 rgba(0,0,0,0.10)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'right 0.3s',
        background: undefined,
      };
    } else {
      return {
        left: 'auto',
        right: '2rem',
        bottom: '4rem',
        width: '500px',
        height: '600px',
        borderRadius: '1.25rem',
        maxWidth: '95vw',
        maxHeight: '95vh',
        background: undefined,
      };
    }
  }, [isDesktop, theme]);

  const handleSubmit = useCallback(async (promptOverride?: string) => {
    const promptToSend = typeof promptOverride === "string" ? promptOverride : inputPrompt;
    if (!promptToSend.trim()) return;

    const normalizedPrompt = promptToSend.trim().replace(/^\/(\s+)/, '/').replace(/\s+/g, ' ');
    const matched = commands.find(cmd => normalizedPrompt.toLowerCase() === cmd.command.toLowerCase());
    if (matched) {
      await matched.handler({
        input: promptToSend,
        setChatHistory,
        setInputPrompt,
      });
      return;
    }

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
        }, 1200);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setChatHistory((prev) => [...prev, { type: 'ai', text: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputPrompt, setChatHistory, setInputPrompt, chatHistory, setIsLoading]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleVoiceInput = useCallback(() => {
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
  }, []);

  const isInputEmpty = inputPrompt.trim().length === 0;

  const handleInsertCommand = useCallback((cmd: string, autoSubmit = false) => {
    setInputPrompt(cmd);
    setShowCommandList(false);
    if (autoSubmit) {
      setTimeout(() => handleSubmit(cmd), 0);
    }
  }, [handleSubmit]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandList && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleInsertCommand(filteredCommands[selectedCommandIndex].command);
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !(showCommandList && filteredCommands.length > 0)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [showCommandList, filteredCommands, selectedCommandIndex, handleInsertCommand, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-[101] animate-slide-up flex flex-col transition-all aiwindow-mobile ${isDesktop ? 'aiwindow-desktop' : ''} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
      style={panelStyle}
    >
      <style>{`
        @media (max-width: 640px) {
          .aiwindow-mobile {
            left: 50% !important;
            right: auto !important;
            top: auto !important;
            bottom: 1.5rem !important;
            transform: translateX(-50%) !important;
            width: 98vw !important;
            height: 80vh !important;
            border-radius: 1.5rem !important;
            max-width: 420px !important;
            max-height: 90vh !important;
            box-shadow: 0 4px 32px 0 rgba(0,0,0,0.12);
            border: none !important;
            padding: 0 !important;
          }
        }
        @media (min-width: 641px) {
          .aiwindow-desktop {
            left: auto !important;
            right: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            width: 420px !important;
            min-width: 340px !important;
            max-width: 32vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: 0 0 32px 0 rgba(0,0,0,0.10);
            border-left: none !important;
            padding: 0 !important;
            transform: none !important;
          }
        }
      `}</style>
      <div className="flex flex-col h-full">
        <div className={`flex justify-between items-center px-5 pt-5 pb-3 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800 rounded-t-3xl' : 'border-gray-100 bg-white/90 rounded-t-3xl'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <img
              src={theme === 'dark' ? '/hive-icon-white.png' : '/hive-icon.png'}
              alt="Hive Logo"
              className="w-8 h-8"
            />
            <h3 className={`text-2xl font-extrabold tracking-tight drop-shadow-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("title")}</h3>
          </div>
          <div className="flex items-center gap-2">
            {chatHistory.length > 0 && (
              <button
                onClick={clearChatHistory}
                className={`transition-all text-sm font-medium px-2 py-1 rounded ${theme === 'dark' ? 'text-gray-400 hover:text-blue-300' : 'text-gray-400 hover:text-blue-500'}`}
                title={t("clearHistory")}
              >
                {t("clear")}
              </button>
            )}
            <button
              className={`ml-2 text-2xl font-bold z-10 transition-colors flex items-center justify-center h-10 w-10 rounded-full ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={onClose}
              aria-label={t("close")}
              style={{ marginTop: '-6px' }}
            >
              <FaTimes style={{ verticalAlign: 'middle' }} />
            </button>
          </div>
        </div>


        <div ref={chatHistoryRef} className={`flex-1 overflow-y-auto px-2 py-4 custom-scrollbar ${theme === 'dark' ? 'bg-gray-900' : 'bg-transparent'}`}> 
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className={`text-lg text-center font-medium opacity-80 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t("welcomeMessageFirst")}
                <span className="text-primary font-semibold">{t("welcomeMessageAssistant")}</span>
                {t("welcomeMessageExclamation")}
              </p>
              <p className={`text-lg text-center font-medium opacity-80 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t("welcomeMessageSecond")}</p>
              
              <div className="flex gap-2 mt-6 px-7 pt-2">
                {[commands[0], commands[1], commands[3]].map((c) => (
                  <button
                    key={c.command}
                    type="button"
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${theme === 'dark' ? 'bg-blue-900 hover:bg-blue-800 text-blue-200 border-blue-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'}`}
                    onClick={() => handleInsertCommand(c.command, true)}
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {c.command}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} className={`mb-2 px-4 py-2 rounded-2xl text-base shadow-sm max-w-[90%] ${
                msg.type === 'user'
                  ? (theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white self-end ml-auto border border-blue-400'
                      : 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white self-end ml-auto border border-blue-200')
                  : (theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700 text-gray-100 self-start mr-auto'
                      : 'bg-white/95 border border-gray-100 text-gray-900 self-start mr-auto')
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            ))
          )}
          {isLoading && (
            <div className={`mb-2 px-4 py-2 rounded-2xl max-w-[90%] animate-pulse text-base shadow-sm self-start mr-auto ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white/95 border border-gray-100 text-gray-900'}`}> 
              {t("thinking")}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="mb-2 flex flex-col gap-2 items-stretch w-full px-3 pb-3 bg-transparent relative">
          {/* Command completions dropdown - Above input */}
          {showCommandList && filteredCommands.length > 0 && (
            <div className={`absolute left-3 bottom-full mb-2 z-50 rounded-xl shadow-lg px-2 py-1 min-w-[200px] max-w-[300px] text-sm animate-fadeIn ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white border border-gray-200'}`}>
              {filteredCommands.map((c, idx) => (
                <div
                  key={c.command}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors duration-150
                    ${theme === 'dark'
                      ? idx === selectedCommandIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-blue-800 hover:text-white'
                      : idx === selectedCommandIndex
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'hover:bg-blue-50'}
                  `}
                  onClick={() => handleInsertCommand(c.command)}
                >
                  <span className={`font-mono ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{c.command}</span> <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className={`flex flex-row items-center gap-2 w-full rounded-full shadow-inner transition-all px-3 py-2 border focus-within:border-blue-400 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/95 border-gray-200'}`}>
            <div className="flex-1 flex items-center order-1">
              <textarea
                className={`w-full h-10 p-0 px-3 bg-transparent border-none focus:outline-none text-base resize-none placeholder-gray-400 font-medium tracking-tight focus:placeholder-gray-300 transition-all rounded-full shadow-none min-h-[2.5rem] max-h-[5rem] ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
                style={{ boxShadow: 'none', background: 'none', border: 'none', fontFamily: 'inherit', letterSpacing: '0.01em', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                placeholder={isLoading ? t("waitingResponse") : t("typeMessage")}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading}
                rows={1}
              ></textarea>
            </div>
              
            <div className="flex items-center order-2">
              <button
                onClick={isInputEmpty ? handleVoiceInput : () => handleSubmit()}
                className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${isRecording ? "animate-pulse border-blue-500" : ""} ${isInputEmpty ? (theme === 'dark' ? 'border-gray-700 bg-gray-800 hover:bg-blue-900 text-gray-300' : 'border-gray-200 bg-white hover:bg-blue-100') : (theme === 'dark' ? 'bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-800 hover:to-blue-950 border-blue-700 shadow-md' : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 border-blue-500 shadow-md')}`}
                disabled={isLoading}
                title={isInputEmpty ? t("recordVoice") : t("send")}
                style={{ minWidth: '40px', minHeight: '40px', transition: 'background 0.2s, color 0.2s' }}
              >
                
                <span className="relative block w-6 h-6">
                  <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out
                      ${isInputEmpty ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
                    style={{ transition: 'opacity 0.3s, transform 0.3s' }}
                  >
                    
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`mx-auto text-blue-600 ${isRecording ? 'animate-pulse' : ''}`}> <rect x="9" y="2" width="6" height="12" rx="3" fill="#2563eb" stroke="none"/> <rect x="9" y="2" width="6" height="12" rx="3" fill="none"/> <path d="M5 10v2a7 7 0 0 0 14 0v-2" stroke="#2563eb" strokeWidth="2.2"/> <line x1="12" y1="22" x2="12" y2="18" stroke="#2563eb" strokeWidth="2.2"/> <line x1="8" y1="22" x2="16" y2="22" stroke="#2563eb" strokeWidth="2.2"/> </svg>
                  </span>
                  <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out
                      ${!isInputEmpty ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
                    style={{ transition: 'opacity 0.3s, transform 0.3s' }}
                  >
                    
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className={`mt-auto pt-4 pb-2 text-center text-xs border-t rounded-b-2xl shadow-inner flex flex-col items-center ${theme === 'dark' ? 'text-gray-400 border-gray-700 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900' : 'text-gray-500 border-gray-100 bg-gradient-to-r from-white/90 via-blue-50 to-white/90'}`}>
          <div className="flex items-center gap-2 justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="inline-block align-middle text-blue-500"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill={theme === 'dark' ? '#1e293b' : '#e0e7ef'}/><path d="M8 12l2.5 2.5L16 9" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-semibold text-primary tracking-wide">{t("poweredByGemini")}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default React.memo(AIWindow);
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAIWindow } from "@/contexts/AIWindowContext";
import { useTranslations } from "next-intl";

// Define the type for handler parameters
export type CommandHandlerParams = {
  input: string;
  setChatHistory: React.Dispatch<React.SetStateAction<{ type: 'user' | 'ai'; text: string }[]>>;
  setInputPrompt: React.Dispatch<React.SetStateAction<string>>;
};

// Use the type in your commands array
type Command = {
  command: string;
  label: string;
  handler: (params: CommandHandlerParams) => Promise<void>;
};

// --- Command definitions with handlers ---
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
  // Add more commands here as needed
];

interface AIWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop?: boolean; // New prop to control desktop mode
  locale?: string; // Accept locale, but do not pass to useTranslations
}

// Use the correct translation namespace and pass locale
const AIWindow: React.FC<AIWindowProps> = ({
  isOpen,
  onClose,
  isDesktop = false,
  locale,
}) => {
  const t = useTranslations("AIWindow");

  const [inputPrompt, setInputPrompt] = useState("");
  const { chatHistory, setChatHistory, clearChatHistory } = useAIWindow(); // Add clearChatHistory
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

  useEffect(() => {
    if (inputPrompt.startsWith('/')) {
      setShowCommandList(true);
      const filter = inputPrompt.slice(1).toLowerCase();
      const filtered = commands.filter(c => c.command.slice(1).startsWith(filter));
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0); // Reset selection on new filter
    } else {
      setShowCommandList(false);
    }
  }, [inputPrompt]);

  if (!isOpen) return null;

  // Responsive style: right panel on desktop, modal on mobile
  const panelStyle: React.CSSProperties = isDesktop
    ? {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        maxWidth: '32vw',
        minWidth: '340px',
        height: '100vh',
        borderRadius: '0',
        boxShadow: '0 0 32px 0 rgba(0,0,0,0.10)',
        zIndex: 50,
        background: 'linear-gradient(135deg, #fff 60%, #e0e7ef 100%)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'right 0.3s',
      }
    : {
        left: 'auto',
        right: '2rem',
        bottom: '4rem',
        width: '500px',
        height: '600px',
        borderRadius: '1.25rem',
        maxWidth: '95vw',
        maxHeight: '95vh',
      };

  // --- Unified command processing ---
  const handleSubmit = async (promptOverride?: string) => {
    const promptToSend = typeof promptOverride === "string" ? promptOverride : inputPrompt;
    if (!promptToSend.trim()) return;

    // Try to match a command (ignore leading/trailing spaces and allow for extra spaces after slash)
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

  // Insert command from quick button or dropdown
  const handleInsertCommand = (cmd: string, autoSubmit = false) => {
    setInputPrompt(cmd);
    setShowCommandList(false);
    if (autoSubmit) {
      setTimeout(() => handleSubmit(cmd), 0);
    }
  };

  // Keyboard navigation for command list
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    // Existing Enter-to-submit logic
    if (e.key === 'Enter' && !e.shiftKey && !(showCommandList && filteredCommands.length > 0)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`fixed z-[101] animate-slide-up flex flex-col transition-all aiwindow-mobile ${isDesktop ? 'aiwindow-desktop' : ''}`}
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
            border-left: 1px solid #e5e7eb;
            padding: 0 !important;
            transform: none !important;
          }
        }
      `}</style>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100 bg-white/90 rounded-t-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/hive-icon.png" alt="Hive Logo" className="w-8 h-8" />
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{t("title")}</h3>
          </div>
          <div className="flex items-center gap-2">
            {chatHistory.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="text-gray-400 hover:text-blue-500 transition-all text-sm font-medium px-2 py-1 rounded"
                title={t("clearHistory")}
              >
                {t("clear")}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-all text-2xl font-bold"
              aria-label={t("closeLabel")}
            >
              ✕
            </button>
          </div>
        </div>


        {/* Chat History */}
        <div ref={chatHistoryRef} className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar bg-transparent">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 text-lg text-center font-medium opacity-80">
                {t("welcomeMessageFirst")}
                <span className="text-primary font-semibold">
                  {t("welcomeMessageAssistant")}
                </span>
                {t("welcomeMessageExclamation")}
              </p>
              <p className="text-gray-500 text-lg text-center font-medium opacity-80">
                {t("welcomeMessageSecond")}
              </p>
              
              {/* Quick command buttons - Only show if chat is empty */}
              <div className="flex gap-2 mt-6 px-7 pt-2">
                {[commands[0], commands[1], commands[3]].map((c) => (
                  <button
                    key={c.command}
                    type="button"
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-200 transition-all"
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
                  ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white self-end ml-auto border border-blue-200'
                  : 'bg-white/95 border border-gray-100 text-gray-900 self-start mr-auto'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            ))
          )}
          {isLoading && (
            <div className="mb-2 px-4 py-2 rounded-2xl bg-white/95 border border-gray-100 text-gray-900 self-start mr-auto max-w-[90%] animate-pulse text-base shadow-sm">
              {t("thinking")}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="mb-2 flex flex-col gap-2 items-stretch w-full px-3 pb-3 bg-transparent relative">
          {/* Command completions dropdown - Above input */}
          {showCommandList && filteredCommands.length > 0 && (
            <div className="absolute left-3 bottom-full mb-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg px-2 py-1 min-w-[200px] max-w-[300px] text-sm animate-fadeIn">
              {filteredCommands.map((c, idx) => (
                <div
                  key={c.command}
                  className={`px-2 py-1 hover:bg-blue-50 rounded cursor-pointer ${idx === selectedCommandIndex ? 'bg-blue-100 text-blue-900 font-semibold' : ''}`}
                  onClick={() => handleInsertCommand(c.command)}
                >
                  <span className="font-mono text-blue-700">{c.command}</span> <span className="text-gray-500">{c.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-row items-center gap-2 w-full bg-white/95 rounded-full shadow-inner border border-gray-200 focus-within:border-blue-400 transition-all px-3 py-2">
            <div className="flex-1 flex items-center order-1">
              <textarea
                className="w-full h-10 p-0 px-3 bg-transparent border-none focus:outline-none text-gray-900 text-base resize-none placeholder-gray-400 font-medium tracking-tight focus:placeholder-gray-300 transition-all rounded-full shadow-none min-h-[2.5rem] max-h-[5rem]"
                style={{ boxShadow: 'none', background: 'none', border: 'none', fontFamily: 'inherit', letterSpacing: '0.01em', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                placeholder={isLoading ? t("waitingResponse") : t("typeMessage")}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleInputKeyDown}
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
                title={isInputEmpty ? t("recordVoice") : t("send")}
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
            <span className="font-semibold text-primary tracking-wide">{t("poweredByGemini")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWindow;
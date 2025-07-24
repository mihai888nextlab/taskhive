import React from 'react';

interface AiAnalyticsSuggestionsProps {
  theme: string;
  t: (key: string, params?: any) => string;
  aiTab: 'analytics' | 'suggestions';
  setAiTab: (tab: 'analytics' | 'suggestions') => void;
  aiAnalytics: string;
  aiSuggestions: string;
}

const AiAnalyticsSuggestions: React.FC<AiAnalyticsSuggestionsProps> = ({ theme, t, aiTab, setAiTab, aiAnalytics, aiSuggestions }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-10 min-h-[180px] flex flex-col justify-center col-span-2 border`}>
        <h2 className={`font-bold text-2xl mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("aiAnalyticsSuggestions")}</h2>
        <div className="flex gap-4 mb-4">
          <button onClick={() => setAiTab('analytics')} className={`px-6 py-2 rounded-full font-semibold text-base transition ${aiTab==='analytics' ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white') : (theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-700')}`}>{t("analytics")}</button>
          <button onClick={() => setAiTab('suggestions')} className={`px-6 py-2 rounded-full font-semibold text-base transition ${aiTab==='suggestions' ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white') : (theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-700')}`}>{t("suggestions")}</button>
        </div>
        <div className={`text-base whitespace-pre-line min-h-[60px] leading-snug ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {(aiTab === 'analytics' && !aiAnalytics) || (aiTab === 'suggestions' && !aiSuggestions) ? (
            <div className="text-gray-400 text-lg">{t("loadingAI", { type: t(aiTab) })}</div>
          ) : aiTab === 'analytics' ? (
            <div className="ai-response" dangerouslySetInnerHTML={{ __html: aiAnalytics.replace(/\*\*(.*?)\*\*/g, `<span class='font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}'>$1</span>`).replace(/\*(.*?)\*/g, `<span class='font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}'>$1</span>`).replace(/\n- /g, '<br>• ') }} />
          ) : (
            <div className="ai-response" dangerouslySetInnerHTML={{ __html: aiSuggestions.replace(/\*\*(.*?)\*\*/g, `<span class='font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}'>$1</span>`).replace(/\*(.*?)\*/g, `<span class='font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}'>$1</span>`).replace(/\n- /g, '<br>• ') }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAnalyticsSuggestions;

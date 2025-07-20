import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../components/ThemeContext';
import DashboardLayout from '../../components/sidebar/DashboardLayout';
import ExpensePieChart from '../../components/ExpensePieChart';
import TaskStatistics from '../../components/TaskStatistics';
import FinanceStatistics from '../../components/FinanceStatistics';
import TimeStatistics from '../../components/TimeStatistics';
import classNames from 'classnames';
import { FaTasks, FaMoneyBillWave, FaClock, FaComments, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { useTranslations } from "next-intl";

// Types for user statistics
interface Expense {
  _id: string;
  title: string;
  amount: number;
  category?: string;
  [key: string]: any;
}

interface TimeSession {
  _id: string;
  name: string;
  duration: number;
  tag?: string;
  [key: string]: any;
}

const InsightsPage = React.memo(() => {
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Expense[]>([]); // Reuse Expense type for incomes
  const [timeSessions, setTimeSessions] = useState<TimeSession[]>([]);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<{ completed: number; total: number; last7Days: number[] }>({ completed: 0, total: 0, last7Days: [0,0,0,0,0,0,0] });
  const [financeStats, setFinanceStats] = useState<{ expenses: number[]; incomes: number[]; labels: string[] }>({ expenses: [0,0,0,0,0,0,0], incomes: [0,0,0,0,0,0,0], labels: ['6d ago','5d ago','4d ago','3d ago','2d ago','Yesterday','Today'] });
  const [pieData, setPieData] = useState<{ [cat: string]: number }>({});
  const [incomePieData, setIncomePieData] = useState<{ [cat: string]: number }>({});
  const [aiTab, setAiTab] = useState<'analytics' | 'suggestions'>('analytics');
  const [aiAnalytics, setAiAnalytics] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const t = useTranslations("InsightsPage");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get current user
        const userRes = await fetch('/api/user');
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();
        setUser(userData.user);
        const userId = userData.user._id || userData.user.id;

        // 2. Get all expenses (and incomes) for user
        const expensesRes = await fetch(`/api/expenses?userId=${userId}`);
        const allData: Expense[] = await expensesRes.json();
        const expensesData = Array.isArray(allData) ? allData.filter(e => e.type === 'expense') : [];
        const incomesData = Array.isArray(allData) ? allData.filter(e => e.type === 'income') : [];
        setExpenses(expensesData);
        setIncomes(incomesData);

        // 3. Get time sessions for user
        const timeRes = await fetch(`/api/time-sessions?userId=${userId}`);
        const timeData: TimeSession[] = await timeRes.json();
        setTimeSessions(Array.isArray(timeData) ? timeData : []);
        // Calculate total hours and last 7 days hours
        const totalHours = timeData.reduce((a, b) => a + b.duration, 0) / 3600;
        // Group by day for last 7 days (hours)
        const last7DaysHours = Array(7).fill(0);
        const today = new Date(); today.setHours(0,0,0,0);
        timeData.forEach(session => {
          const sessionDate = new Date(session.createdAt);
          sessionDate.setHours(0,0,0,0);
          const diff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000*3600*24));
          if (diff >= 0 && diff < 7) last7DaysHours[6-diff] += session.duration / 3600;
        });

        // 4. Get tasks for user (real API)
        const tasksRes = await fetch(`/api/tasks`); // Auth cookie will filter by user
        const tasksData = await tasksRes.json();
        // Only consider tasks from the last 7 days
        const now = new Date();
        const last7dTasks = tasksData.filter((t: any) => {
          const date = new Date(t.updatedAt || t.createdAt);
          const daysAgo = (now.getTime() - date.getTime()) / (1000*60*60*24);
          return daysAgo >= 0 && daysAgo < 7;
        });
        // Calculate stats for user's tasks in last 7 days
        const completedTasks = last7dTasks.filter((t: any) => t.completed).length;
        const last7Days = Array(7).fill(0);
        last7dTasks.forEach((t: any) => {
          if (t.completed && t.updatedAt) {
            const daysAgo = Math.floor((now.getTime() - new Date(t.updatedAt).getTime()) / (1000*60*60*24));
            if (daysAgo >= 0 && daysAgo < 7) last7Days[6-daysAgo]++;
          }
        });
        setTaskStats({ completed: completedTasks, total: last7dTasks.length, last7Days });

        // Calculate completedLast7d and trendArr directly from last7Days
        const completedLast7d = last7Days.reduce((a, b) => a + b, 0);
        const trendArr = last7Days;

        // 5. Prepare finance stats for charts (group expenses and incomes by day)
        const expensesByDay = [0,0,0,0,0,0,0];
        const incomesByDay = [0,0,0,0,0,0,0];
        expensesData.forEach((e) => {
          const daysAgo = Math.floor((now.getTime() - new Date(e.date || e.createdAt).getTime()) / (1000*60*60*24));
          if (daysAgo >= 0 && daysAgo < 7) expensesByDay[6-daysAgo] += e.amount;
        });
        incomesData.forEach((i) => {
          const daysAgo = Math.floor((now.getTime() - new Date(i.date || i.createdAt).getTime()) / (1000*60*60*24));
          if (daysAgo >= 0 && daysAgo < 7) incomesByDay[6-daysAgo] += i.amount;
        });
        setFinanceStats({ expenses: expensesByDay, incomes: incomesByDay, labels: ['6d ago','5d ago','4d ago','3d ago','2d ago','Yesterday','Today'] });
        // 6. Prepare pie data for expenses by category
        const pie: { [cat: string]: number } = {};
        expensesData.forEach((e) => { pie[e.category || 'Other'] = (pie[e.category || 'Other'] || 0) + e.amount; });
        setPieData(pie);
        // Prepare pie data for incomes by category
        const incomePieData: { [cat: string]: number } = {};
        incomesData.forEach((i) => { incomePieData[i.category || 'Other'] = (incomePieData[i.category || 'Other'] || 0) + i.amount; });
        setIncomePieData(incomePieData);
        // 7. Prepare detailed prompt for Gemini
        const statsSummary = `User statistics summary:\n- Total expenses: ${expensesData.length}, total spent: ${expensesData.reduce((a,b)=>a+b.amount,0)}\n- Total incomes: ${incomesData.length}, total earned: ${incomesData.reduce((a,b)=>a+b.amount,0)}\n- Expenses by category: ${Object.entries(pie).map(([k,v])=>`${k}: ${v}`).join(', ')}\n- Time sessions: ${timeData.length}, total hours: ${totalHours.toFixed(2)}\n- Tasks: total ${last7dTasks.length}, completed last 7d: ${completedLast7d}, trend: ${trendArr.join(', ')}.\nGive me personalized, actionable recommendations to improve my productivity and finances, referencing my most frequent categories and time usage.\n`;
        const analyticsPrompt = `You are a world-class business and productivity analyst. Given the following user statistics, provide a highly structured, data-driven analysis using only bullet points. Each bullet should start with a bolded label (e.g., *Business Expenses: 40%*) followed by a concise insight. Use clear section headers in bold markdown (e.g., **Financial Analysis:**, **Time Analysis:**, **Task Analysis:**). Use percentages, comparisons, and highlight strengths and weaknesses. Do not give advice or suggestions—focus only on analysis and insights. No paragraphs, only bullet points. Limit your response to the 3 most important insights per section, and keep each bullet point under 15 words. Make the response as short as possible while remaining useful.\n\nUser statistics:\n- Total expenses: ${expensesData.length}, total spent: ${expensesData.reduce((a,b)=>a+b.amount,0)}\n- Total incomes: ${incomesData.length}, total earned: ${incomesData.reduce((a,b)=>a+b.amount,0)}\n- Expenses by category: ${Object.entries(pie).map(([k,v])=>`${k}: ${v}`).join(', ')}\n- Time sessions: ${timeData.length}, total hours: ${totalHours.toFixed(2)}\n- Tasks: total ${last7dTasks.length}, completed last 7d: ${completedLast7d}, trend: ${trendArr.join(', ')}.`;
        const suggestionsPrompt = `You are a world-class productivity and finance coach. Given the following user statistics, provide highly structured, actionable suggestions using only bullet points. Each bullet should start with a bolded label (e.g., *Prioritize Tasks:*) followed by a concise, motivating suggestion. Use clear section headers in bold markdown (e.g., **Financial Suggestions:**, **Time Management Suggestions:**, **Task Suggestions:**). Reference the user's most frequent categories, time usage, and task completion trends. Use a friendly, motivating tone. No paragraphs, only bullet points. Limit your response to the 3 most important suggestions per section, and keep each bullet point under 15 words. Make the response as short as possible while remaining useful.\n\nUser statistics:\n- Total expenses: ${expensesData.length}, total spent: ${expensesData.reduce((a,b)=>a+b.amount,0)}\n- Total incomes: ${incomesData.length}, total earned: ${incomesData.reduce((a,b)=>a+b.amount,0)}\n- Expenses by category: ${Object.entries(pie).map(([k,v])=>`${k}: ${v}`).join(', ')}\n- Time sessions: ${timeData.length}, total hours: ${totalHours.toFixed(2)}\n- Tasks: total ${last7dTasks.length}, completed last 7d: ${completedLast7d}, trend: ${trendArr.join(', ')}.`;

        // Fetch AI analytics and suggestions asynchronously (do not block UI)
        setTimeout(() => {
          Promise.all([
            fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: analyticsPrompt })
            }).then(res => res.json()).then(data => setAiAnalytics(data.response || 'No analytics available.')).catch(() => setAiAnalytics('Failed to load AI analytics.')),
            fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: suggestionsPrompt })
            }).then(res => res.json()).then(data => setAiSuggestions(data.response || 'No suggestions available.')).catch(() => setAiSuggestions('Failed to load AI suggestions.'))
          ]);
        }, 0);

      } catch (err) {
        setAiInsights('Failed to load AI insights.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoize last7DaysHours
  const last7DaysHours = useMemo(() => {
    const arr = Array(7).fill(0);
    const today = new Date(); today.setHours(0,0,0,0);
    timeSessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      sessionDate.setHours(0,0,0,0);
      const diff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000*3600*24));
      if (diff >= 0 && diff < 7) arr[6-diff] += session.duration / 3600;
    });
    return arr;
  }, [timeSessions]);

  // Memoize pieData and incomePieData
  const memoPieData = useMemo(() => {
    const pie: { [cat: string]: number } = {};
    expenses.forEach((e) => { pie[e.category || 'Other'] = (pie[e.category || 'Other'] || 0) + e.amount; });
    return pie;
  }, [expenses]);
  const memoIncomePieData = useMemo(() => {
    const pie: { [cat: string]: number } = {};
    incomes.forEach((i) => { pie[i.category || 'Other'] = (pie[i.category || 'Other'] || 0) + i.amount; });
    return pie;
  }, [incomes]);

  // Memoize financeStats
  const memoFinanceStats = useMemo(() => {
    const expensesByDay = [0,0,0,0,0,0,0];
    const incomesByDay = [0,0,0,0,0,0,0];
    const now = new Date();
    expenses.forEach((e) => {
      const daysAgo = Math.floor((now.getTime() - new Date(e.date || e.createdAt).getTime()) / (1000*60*60*24));
      if (daysAgo >= 0 && daysAgo < 7) expensesByDay[6-daysAgo] += e.amount;
    });
    incomes.forEach((i) => {
      const daysAgo = Math.floor((now.getTime() - new Date(i.date || i.createdAt).getTime()) / (1000*60*60*24));
      if (daysAgo >= 0 && daysAgo < 7) incomesByDay[6-daysAgo] += i.amount;
    });
    return { expenses: expensesByDay, incomes: incomesByDay, labels: ['6d ago','5d ago','4d ago','3d ago','2d ago','Yesterday','Today'] };
  }, [expenses, incomes]);

  // Memoize taskStats.last7Days
  const memoTaskStats = useMemo(() => taskStats.last7Days, [taskStats]);

  // Memoize AI tab switch
  const handleAiTabSwitch = useCallback((tab: 'analytics' | 'suggestions') => setAiTab(tab), []);

  const { theme } = useTheme();
  return (
      <div className={`p-6 md:p-8 min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}> 
        {/* Executive Summary Card */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl flex flex-col items-center p-10 border animate-pulse`}>
                <div className={`h-10 w-10 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mb-4`} />
                <div className={`h-4 w-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`} />
                <div className={`h-8 w-24 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`} />
                <div className={`h-4 w-24 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
                <div className="text-xs text-gray-400 mt-4">{[t("loadingTasks"), t("loadingExpenses"), t("loadingTimeTracked"), t("loadingCommunication")][i]}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl flex flex-col items-center p-10 border group`}>
              <FaTasks className="text-4xl text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">{t("tasks")}</div>
              <div className={`text-4xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{taskStats.total}</div>
              <div className="text-sm text-green-600 font-semibold">{taskStats.completed} {t("completed7d")}</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl flex flex-col items-center p-10 border group`}>
              <FaMoneyBillWave className="text-4xl text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">{t("totalSpent")}</div>
              <div className={`text-4xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${expenses.reduce((a,b)=>a+b.amount,0)}</div>
              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{Object.keys(pieData).length} {t("categories")}</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl flex flex-col items-center p-10 border group`}>
              <FaClock className="text-4xl text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">{t("timeTracked")}</div>
              <div className={`text-4xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(timeSessions.reduce((a,b)=>a+b.duration,0)/3600).toFixed(2)} hrs</div>
              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{timeSessions.length} {t("sessions")}</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl flex flex-col items-center p-10 border group`}>
              <FaComments className="text-4xl text-pink-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">{t("communication")}</div>
              <div className={`text-4xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>-</div>
              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t("comingSoon")}</div>
            </div>
          </div>
        )}
        {/* Predictive Analytics & Anomaly Detection */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-10 border animate-pulse min-h-[140px] flex flex-col justify-center items-center`}>
                <div className={`h-6 w-40 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4`} />
                <div className={`h-4 w-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`} />
                <div className={`h-4 w-56 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`} />
                <div className={`h-4 w-48 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
                <div className="text-xs text-gray-400 mt-4">{[t("loadingAnalytics"), t("loadingAnomalyDetection")][i]}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-10 border min-h-[140px]`}>
              <div className="flex items-center mb-4"><FaChartLine className="text-blue-500 mr-2 text-xl" /><span className={`font-bold text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("predictiveAnalytics")}</span></div>
              <ul className={`text-base pl-2 list-disc space-y-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}> 
                <li><span className="font-semibold">{t("taskCompletionForecast")}</span>: Next week’s completion rate is likely to be similar to this week’s ({taskStats.completed}/7d).</li>
                <li><span className="font-semibold">{t("budgetRisk")}</span>: Spending is {expenses.reduce((a,b)=>a+b.amount,0) > 1000 ? 'above' : 'within'} expected range.</li>
                <li><span className="font-semibold">{t("timeUsage")}</span>: Avg session: {timeSessions.length ? Math.round(timeSessions.reduce((a,b)=>a+b.duration,0)/timeSessions.length) : 0} min.</li>
              </ul>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-10 border min-h-[140px]`}>
              <div className="flex items-center mb-4"><FaExclamationTriangle className="text-yellow-500 mr-2 text-xl" /><span className={`font-bold text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("anomalyDetection")}</span></div>
              <ul className={`text-base pl-2 list-disc space-y-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}> 
                <li><span className="font-semibold">{t("expenseSpike")}</span>: {expenses.length > 0 && Math.max(...expenses.map(e=>e.amount)) > 500 ? 'Unusually high expense detected.' : 'No anomalies.'}</li>
                <li><span className="font-semibold">{t("productivityDrop")}</span>: {taskStats.last7Days[6] < 1 ? 'No tasks completed today.' : 'Normal activity.'}</li>
                <li><span className="font-semibold">{t("timeSink")}</span>: {timeSessions.length > 0 && Math.max(...timeSessions.map(t=>t.duration)) > 180 ? 'Long session detected.' : 'No anomalies.'}</li>
              </ul>
            </div>
          </div>
        )}
        {/* AI Analytics & Suggestions between summary and main dashboard */}
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
        {loading ? (
          <div className="text-center text-gray-400 text-xl font-medium py-24">{t("loadingInsights")}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left column: Pie + Table */}
            <div className="flex flex-col gap-4">
              {/* Expenses and Incomes Pie Charts side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-12 flex flex-col items-center min-h-[340px] border`}>
                  <h2 className={`font-bold text-2xl mb-8 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("expensesByCategory")}</h2>
                  <div className="w-full flex flex-col items-center">
                    <div className="w-56 h-56 flex items-center justify-center">
                      <ExpensePieChart data={memoPieData} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {Object.entries(pieData).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([cat], i) => (
                        <span key={cat} className={classNames('px-4 py-1 rounded-full text-sm font-semibold', [
                          'bg-[#FF6384] text-white',
                          'bg-[#36A2EB] text-white',
                          'bg-[#FFCE56] text-gray-900',
                          'bg-[#4BC0C0] text-white',
                          'bg-[#9966FF] text-white',
                          'bg-[#FF9F40] text-white',
                          'bg-[#C9CBCF] text-gray-900',
                        ][i % 7])}>{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-12 flex flex-col items-center min-h-[340px] border`}>
                  <h2 className={`font-bold text-2xl mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("incomesByCategory")}</h2>
                  <div className="w-full flex flex-col items-center">
                    <div className="w-56 h-56 flex items-center justify-center">
                      <ExpensePieChart data={memoIncomePieData} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {Object.entries(incomePieData).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([cat], i) => (
                        <span key={cat} className={classNames('px-4 py-1 rounded-full text-sm font-semibold', [
                          'bg-[#36A2EB] text-white',
                          'bg-[#FF6384] text-white',
                          'bg-[#4BC0C0] text-white',
                          'bg-[#FFCE56] text-gray-900',
                          'bg-[#9966FF] text-white',
                          'bg-[#FF9F40] text-white',
                          'bg-[#C9CBCF] text-gray-900',
                        ][i % 7])}>{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right column: Trends + AI */}
            <div className="flex flex-col gap-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-16 min-h-[380px] flex flex-col justify-center border`}>
                  <h2 className={`font-bold text-2xl mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("financeOverview")}</h2>
                  <FinanceStatistics 
                    expensesData={memoFinanceStats.expenses} 
                    incomesData={memoFinanceStats.incomes} 
                    labels={memoFinanceStats.labels} 
                    hideHeader 
                    hideSummary 
                    className="h-[320px]"
                  />
                </div>
            </div>
            {/* Full width row: Time & Tasks */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-16 min-h-[380px] flex flex-col justify-center border`}>
                <h2 className={`font-bold text-2xl mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("hoursWorked")}</h2>
                <TimeStatistics 
                  last7DaysHours={last7DaysHours} 
                  hideHeader 
                  hideSummary 
                  className="h-[320px]"
                />
              </div>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-16 min-h-[380px] flex flex-col justify-center border`}>
                <h2 className={`font-bold text-2xl mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("taskStatistics")}</h2>
                <div className={`mb-4 text-lg font-medium flex flex-wrap items-center gap-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <span>{t("totalTasks")}: <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{taskStats.total}</span></span>
                  <span className="hidden md:inline">|</span>
                  <span>{t("completed")}: <span className="font-bold text-green-700">{taskStats.completed}</span></span>
                </div>
                <div className="w-full">
                  <TaskStatistics 
                    completed={taskStats.completed} 
                    total={taskStats.total} 
                    last7Days={memoTaskStats} 
                    hideHeader 
                    hideSummary 
                    className="h-[320px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
});

export default React.memo(InsightsPage);

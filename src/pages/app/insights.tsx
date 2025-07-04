import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/sidebar/DashboardLayout';
import ExpensePieChart from '../../components/ExpensePieChart';
import TaskStatistics from '../../components/TaskStatistics';
import FinanceStatistics from '../../components/FinanceStatistics';
import TimeStatistics from '../../components/TimeStatistics';
import classNames from 'classnames';
import { FaTasks, FaMoneyBillWave, FaClock, FaComments, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";

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

const InsightsPage = () => {
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
        // Fetch both analytics and suggestions in parallel
        const [analyticsRes, suggestionsRes] = await Promise.all([
          fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: analyticsPrompt })
          }),
          fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: suggestionsPrompt })
          })
        ]);
        const analyticsData = await analyticsRes.json();
        const suggestionsData = await suggestionsRes.json();
        setAiAnalytics(analyticsData.response || 'No analytics available.');
        setAiSuggestions(suggestionsData.response || 'No suggestions available.');
      } catch (err) {
        setAiInsights('Failed to load AI insights.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 bg-gray-100 min-h-screen font-sans">
        {/* Executive Summary Card */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="text-xs text-gray-400 mt-4">Loading tasks...</div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="text-xs text-gray-400 mt-4">Loading expenses...</div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="text-xs text-gray-400 mt-4">Loading time tracked...</div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="text-xs text-gray-400 mt-4">Loading communication...</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 hover:shadow-2xl transition-shadow group">
              <FaTasks className="text-4xl text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">Tasks</div>
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{taskStats.total}</div>
              <div className="text-sm text-green-600 font-semibold">{taskStats.completed} completed (7d)</div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 hover:shadow-2xl transition-shadow group">
              <FaMoneyBillWave className="text-4xl text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">Total Spent</div>
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">${expenses.reduce((a,b)=>a+b.amount,0)}</div>
              <div className="text-sm text-gray-500 font-medium">{Object.keys(pieData).length} categories</div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 hover:shadow-2xl transition-shadow group">
              <FaClock className="text-4xl text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">Time Tracked</div>
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{(timeSessions.reduce((a,b)=>a+b.duration,0)/3600).toFixed(2)} hrs</div>
              <div className="text-sm text-gray-500 font-medium">{timeSessions.length} sessions</div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center p-10 border border-gray-200 hover:shadow-2xl transition-shadow group">
              <FaComments className="text-4xl text-pink-600 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">Communication</div>
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">-</div>
              <div className="text-sm text-gray-500 font-medium">(Coming soon)</div>
            </div>
          </div>
        )}
        {/* Predictive Analytics & Anomaly Detection */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200 animate-pulse min-h-[140px] flex flex-col justify-center items-center">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-64 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-56 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="text-xs text-gray-400 mt-4">Loading analytics...</div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200 animate-pulse min-h-[140px] flex flex-col justify-center items-center">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-64 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-56 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="text-xs text-gray-400 mt-4">Loading anomaly detection...</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200 hover:shadow-2xl transition-shadow min-h-[140px]">
              <div className="flex items-center mb-4"><FaChartLine className="text-blue-500 mr-2 text-xl" /><span className="font-bold text-gray-900 text-lg tracking-tight">Predictive Analytics</span></div>
              <ul className="text-base text-gray-700 pl-2 list-disc space-y-2">
                <li><span className="font-semibold">Task Completion Forecast:</span> Next week’s completion rate is likely to be similar to this week’s ({taskStats.completed}/7d).</li>
                <li><span className="font-semibold">Budget Risk:</span> Spending is {expenses.reduce((a,b)=>a+b.amount,0) > 1000 ? 'above' : 'within'} expected range.</li>
                <li><span className="font-semibold">Time Usage:</span> Avg session: {timeSessions.length ? Math.round(timeSessions.reduce((a,b)=>a+b.duration,0)/timeSessions.length) : 0} min.</li>
              </ul>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200 hover:shadow-2xl transition-shadow min-h-[140px]">
              <div className="flex items-center mb-4"><FaExclamationTriangle className="text-yellow-500 mr-2 text-xl" /><span className="font-bold text-gray-900 text-lg tracking-tight">Anomaly Detection</span></div>
              <ul className="text-base text-gray-700 pl-2 list-disc space-y-2">
                <li><span className="font-semibold">Expense Spike:</span> {expenses.length > 0 && Math.max(...expenses.map(e=>e.amount)) > 500 ? 'Unusually high expense detected.' : 'No anomalies.'}</li>
                <li><span className="font-semibold">Productivity Drop:</span> {taskStats.last7Days[6] < 1 ? 'No tasks completed today.' : 'Normal activity.'}</li>
                <li><span className="font-semibold">Time Sink:</span> {timeSessions.length > 0 && Math.max(...timeSessions.map(t=>t.duration)) > 180 ? 'Long session detected.' : 'No anomalies.'}</li>
              </ul>
            </div>
          </div>
        )}
        {/* AI Analytics & Suggestions between summary and main dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-3xl shadow-2xl p-10 min-h-[180px] flex flex-col justify-center col-span-2 border border-gray-200">
            <h2 className="font-bold text-2xl mb-4 text-gray-900 tracking-tight">AI Analytics & Suggestions</h2>
            <div className="flex gap-4 mb-4">
              <Button
                onClick={() => setAiTab('analytics')}
                className={`px-6 py-2 rounded-full font-semibold text-base transition ${aiTab==='analytics' ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-700'}`}
                variant={aiTab === 'analytics' ? "default" : "ghost"}
              >
                Analytics
              </Button>
              <Button
                onClick={() => setAiTab('suggestions')}
                className={`px-6 py-2 rounded-full font-semibold text-base transition ${aiTab==='suggestions' ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-700'}`}
                variant={aiTab === 'suggestions' ? "default" : "ghost"}
              >
                Suggestions
              </Button>
            </div>
            <div className="text-gray-800 text-base whitespace-pre-line min-h-[60px] leading-snug">
              {loading ? (
                <div className="text-gray-400 text-lg">Loading AI insights...</div>
              ) : aiTab === 'analytics' ? (
                <div className="ai-response" dangerouslySetInnerHTML={{ __html: aiAnalytics.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-gray-900">$1</span>').replace(/\*(.*?)\*/g, '<span class="font-semibold text-gray-900">$1</span>').replace(/\n- /g, '<br>• ') }} />
              ) : (
                <div className="ai-response" dangerouslySetInnerHTML={{ __html: aiSuggestions.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-gray-900">$1</span>').replace(/\*(.*?)\*/g, '<span class="font-semibold text-gray-900">$1</span>').replace(/\n- /g, '<br>• ') }} />
              )}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-400 text-xl font-medium py-24">Loading your insights...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left column: Pie + Table */}
            <div className="flex flex-col gap-10">
              {/* Expenses and Incomes Pie Charts side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center min-h-[340px] border border-gray-200 hover:shadow-2xl transition-shadow">
                  <h2 className="font-bold text-2xl mb-8 text-gray-900 tracking-tight">Expenses by Category</h2>
                  <div className="w-full flex flex-col items-center">
                    <div className="w-56 h-56 flex items-center justify-center">
                      <ExpensePieChart data={pieData} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
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
                <div className="bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center min-h-[340px] border border-gray-200 hover:shadow-2xl transition-shadow">
                  <h2 className="font-bold text-2xl mb-8 text-gray-900 tracking-tight">Incomes by Category</h2>
                  <div className="w-full flex flex-col items-center">
                    <div className="w-56 h-56 flex items-center justify-center">
                      <ExpensePieChart data={incomePieData} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
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
              {/* Example of shadcn calendar for insights (optional, for demo) */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <h2 className="font-bold text-xl mb-4 text-gray-900 tracking-tight">Calendar (Demo)</h2>
                <ShadcnCalendar
                  mode="single"
                  className="border-none !bg-white text-gray-800 p-2 sm:p-4 react-calendar-light-theme w-full max-w-full"
                  // ...add any custom day rendering or props as needed...
                />
              </div>
            </div>
            {/* Right column: Trends + AI */}
            <div className="flex flex-col gap-10">
                <div className="bg-white rounded-3xl shadow-2xl p-16 min-h-[380px] flex flex-col justify-center border border-gray-200 hover:shadow-2xl transition-shadow">
                  <h2 className="font-bold text-2xl mb-4 text-gray-900 tracking-tight">Finance Overview (Last 7 Days)</h2>
                  <FinanceStatistics 
                    expensesData={financeStats.expenses} 
                    incomesData={financeStats.incomes} 
                    labels={financeStats.labels} 
                    hideHeader 
                    hideSummary 
                    className="h-[320px]"
                  />
                </div>
            </div>
            {/* Full width row: Time & Tasks */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 mt-2">
              <div className="bg-white rounded-3xl shadow-2xl p-16 min-h-[380px] flex flex-col justify-center border border-gray-200 hover:shadow-2xl transition-shadow">
                <h2 className="font-bold text-2xl mb-4 text-gray-900 tracking-tight">Hours Worked (Last 7 Days)</h2>
                <TimeStatistics 
                  last7DaysHours={timeSessions.map(t => t.duration/60).slice(0,7)} 
                  hideHeader 
                  hideSummary 
                  className="h-[320px]"
                />
              </div>
              <div className="bg-white rounded-3xl shadow-2xl p-16 min-h-[380px] flex flex-col justify-center border border-gray-200 hover:shadow-2xl transition-shadow">
                <h2 className="font-bold text-2xl mb-4 text-gray-900 tracking-tight">Task Statistics</h2>
                <div className="mb-6 text-lg text-gray-700 font-medium flex flex-wrap items-center gap-4">
                  <span>Total Tasks: <span className="font-bold text-gray-900">{taskStats.total}</span></span>
                  <span className="hidden md:inline">|</span>
                  <span>Completed (7d): <span className="font-bold text-green-700">{taskStats.completed}</span></span>
                </div>
                <div className="w-full">
                  <TaskStatistics 
                    completed={taskStats.completed} 
                    total={taskStats.total} 
                    last7Days={taskStats.last7Days} 
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
    </DashboardLayout>
  );
};

export default InsightsPage;

import React from 'react';
import DashboardLayout from '../../components/sidebar/DashboardLayout';
import { useInsightsPage } from '../../components/insights/useInsightsPage';
import ExecutiveSummary from '../../components/insights/ExecutiveSummary';
import PredictiveAnalytics from '../../components/insights/PredictiveAnalytics';
import AiAnalyticsSuggestions from '../../components/insights/AiAnalyticsSuggestions';
import PieCharts from '../../components/insights/PieCharts';
import FinanceOverview from '../../components/insights/FinanceOverview';
import TimeAndTasks from '../../components/insights/TimeAndTasks';

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
  const {
    theme,
    t,
    expenses,
    pieData,
    timeSessions,
    taskStats,
    loading,
    aiTab,
    setAiTab,
    aiAnalytics,
    aiSuggestions,
    memoPieData,
    memoIncomePieData,
    incomePieData,
    memoFinanceStats,
    last7DaysHours,
    memoTaskStats,
  } = useInsightsPage();

  return (
    <div className={`p-6 md:p-8 min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {loading ? (
        <ExecutiveSummary theme={theme} t={t} taskStats={taskStats} expenses={expenses} pieData={pieData} timeSessions={timeSessions} />
      ) : (
        <ExecutiveSummary theme={theme} t={t} taskStats={taskStats} expenses={expenses} pieData={pieData} timeSessions={timeSessions} />
      )}
      <PredictiveAnalytics theme={theme} t={t} taskStats={taskStats} expenses={expenses} timeSessions={timeSessions} loading={loading} />
      <AiAnalyticsSuggestions theme={theme} t={t} aiTab={aiTab} setAiTab={setAiTab} aiAnalytics={aiAnalytics} aiSuggestions={aiSuggestions} />
      {loading ? (
        <div className="text-center text-gray-400 text-xl font-medium py-24">{t("loadingInsights")}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <PieCharts theme={theme} t={t} memoPieData={memoPieData} pieData={pieData} memoIncomePieData={memoIncomePieData} incomePieData={incomePieData} />
          </div>
          <div className="flex flex-col gap-4">
            <FinanceOverview theme={theme} t={t} memoFinanceStats={memoFinanceStats} />
          </div>
          <TimeAndTasks theme={theme} t={t} last7DaysHours={last7DaysHours} taskStats={taskStats} memoTaskStats={memoTaskStats} />
        </div>
      )}
    </div>
  );
});

export default React.memo(InsightsPage);

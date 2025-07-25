import React from 'react';
import { FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

interface PredictiveAnalyticsProps {
  theme: string;
  t: (key: string) => string;
  taskStats: { completed: number; total: number; last7Days: number[] };
  expenses: { amount: number }[];
  timeSessions: { duration: number }[];
  loading: boolean;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ theme, t, taskStats, expenses, timeSessions, loading }) => {
  if (loading) {
    return (
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
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-10 border min-h-[140px]`}>
        <div className="flex items-center mb-4"><FaChartLine className="text-blue-500 mr-2 text-xl" /><span className={`font-bold text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("predictiveAnalytics")}</span></div>
        <ul className={`text-base pl-2 list-disc space-y-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}> 
          <li><span className="font-semibold">{t("taskCompletionForecast")}</span>: Next week’s completion rate is likely to be similar to this week’s ({taskStats.completed}/7d).</li>
          <li><span className="font-semibold">{t("budgetRisk")}</span>: Spending is {expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) > 1000 ? 'above' : 'within'} expected range.</li>
          <li><span className="font-semibold">{t("timeUsage")}</span>: Avg session: {timeSessions.length ? Math.round(timeSessions.reduce((sum: number, t: { duration: number }) => sum + t.duration, 0)/timeSessions.length) : 0} min.</li>
        </ul>
      </div>
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-10 border min-h-[140px]`}>
        <div className="flex items-center mb-4"><FaExclamationTriangle className="text-yellow-500 mr-2 text-xl" /><span className={`font-bold text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("anomalyDetection")}</span></div>
        <ul className={`text-base pl-2 list-disc space-y-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}> 
          <li><span className="font-semibold">{t("expenseSpike")}</span>: {expenses.length > 0 && Math.max(...expenses.map((e: { amount: number })=>e.amount)) > 500 ? 'Unusually high expense detected.' : 'No anomalies.'}</li>
          <li><span className="font-semibold">{t("productivityDrop")}</span>: {taskStats.last7Days[6] < 1 ? 'No tasks completed today.' : 'Normal activity.'}</li>
          <li><span className="font-semibold">{t("timeSink")}</span>: {timeSessions.length > 0 && Math.max(...timeSessions.map((t: { duration: number })=>t.duration)) > 180 ? 'Long session detected.' : 'No anomalies.'}</li>
        </ul>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;

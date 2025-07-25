import React from 'react';
import { FaTasks, FaMoneyBillWave, FaClock, FaComments } from 'react-icons/fa';

interface ExecutiveSummaryProps {
  theme: string;
  t: (key: string) => string;
  taskStats: { completed: number; total: number; last7Days: number[] };
  expenses: { amount: number }[];
  pieData: Record<string, number>;
  timeSessions: { duration: number }[];
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ theme, t, taskStats, expenses, pieData, timeSessions }) => {
  return (
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
        <div className={`text-4xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)}</div>
        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{Object.keys(pieData).length} {t("categories")}</div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl flex flex-col items-center p-10 border group`}>
        <FaClock className="text-4xl text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
        <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">{t("timeTracked")}</div>
        <div className={`text-4xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(timeSessions.reduce((a: number, b: { duration: number })=>a+b.duration,0)/3600).toFixed(2)} hrs</div>
        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{timeSessions.length} {t("sessions")}</div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl flex flex-col items-center p-10 border group`}>
        <FaComments className="text-4xl text-pink-600 mb-4 group-hover:scale-110 transition-transform" />
        <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">{t("communication")}</div>
        <div className={`text-4xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>-</div>
        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t("comingSoon")}</div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;

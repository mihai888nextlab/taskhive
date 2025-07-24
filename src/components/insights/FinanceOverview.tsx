import React from 'react';
import FinanceStatistics from '../FinanceStatistics';

interface FinanceOverviewProps {
  theme: string;
  t: (key: string) => string;
  memoFinanceStats: { expenses: number[]; incomes: number[]; labels: string[] };
}

export default function FinanceOverview({ theme, t, memoFinanceStats }: FinanceOverviewProps) {
  return (
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
  );
}

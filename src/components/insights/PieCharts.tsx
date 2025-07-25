import React from 'react';
import ExpensePieChart from '../ExpensePieChart';
import classNames from 'classnames';

interface PieChartsProps {
  theme: string;
  t: (key: string) => string;
  memoPieData: Record<string, number>;
  pieData: Record<string, number>;
  memoIncomePieData: Record<string, number>;
  incomePieData: Record<string, number>;
}

export default function PieCharts({ theme, t, memoPieData, pieData, memoIncomePieData, incomePieData }: PieChartsProps) {
  return (
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
  );
}

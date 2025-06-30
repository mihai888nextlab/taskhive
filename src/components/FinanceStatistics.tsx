import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FinanceStatisticsProps {
  expensesData: number[];
  incomesData: number[];
  labels: string[];
  hideHeader?: boolean;
  hideSummary?: boolean;
  className?: string;
}

const FinanceStatistics: React.FC<FinanceStatisticsProps> = ({ expensesData, incomesData, labels, hideHeader, hideSummary, className }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: expensesData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        label: 'Incomes',
        data: incomesData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  return (
    <div className={className ? className : ''}>
      {!hideHeader && <h2 className="font-semibold mb-2">Finance Overview</h2>}
      {!hideSummary && (
        <div className="mb-2 text-sm">Total Expenses: <b>{expensesData.reduce((a,b)=>a+b,0)}</b> | Total Incomes: <b>{incomesData.reduce((a,b)=>a+b,0)}</b></div>
      )}
      <div className="h-[320px]">
        <Bar data={data} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' }, title: { display: false } }, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default FinanceStatistics;
// src/components/FinanceStatistics.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FinanceStatisticsProps {
  expensesData: number[]; // Array of expenses for the last 7 days
  incomesData: number[]; // Array of incomes for the last 7 days
}

const FinanceStatistics: React.FC<FinanceStatisticsProps> = ({ expensesData, incomesData }) => {
  const data = {
    labels: ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago', '6 Days Ago'],
    datasets: [
      {
        label: 'Expenses',
        data: expensesData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Incomes',
        data: incomesData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Finance Overview Over the Last 7 Days',
      },
    },
  };

  return (
    <div className="mt-6">
      <Bar data={data} options={options} />
    </div>
  );
};

export default FinanceStatistics;
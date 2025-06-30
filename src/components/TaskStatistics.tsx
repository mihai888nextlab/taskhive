import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TaskStatisticsProps {
  completed: number;
  total: number;
  last7Days: number[];
  hideHeader?: boolean;
  hideSummary?: boolean;
  className?: string;
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ completed, total, last7Days, hideHeader, hideSummary, className }) => {
  const data = {
    labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: last7Days,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  return (
    <div className={className ? className : ''}>
      {!hideHeader && <h2 className="font-semibold mb-2">Task Statistics</h2>}
      {!hideSummary && (
        <div className="mb-2 text-sm">Total Tasks: <b>{total}</b> | Completed (7d): <b>{completed}</b></div>
      )}
      <div className="h-[320px]">
        <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default TaskStatistics;

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@/components/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatisticsProps {
  totalUsers: number;
  newUsers: number;
  totalTasks: number;
  completedTasks: number;
  newUsersData: number[];
  completedTasksData: number[];
}

const Statistics: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<StatisticsProps | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/get-stats');
      const data = await response.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className={`rounded-lg shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} p-6`}>
        <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} mb-4`}>Statistics Overview</h2>
        <div className="text-gray-400">Loading company statistics...</div>
      </div>
    );
  }

  // Get the last 7 days, but keep the order so 6 Days Ago is first, Today is last
  const getLastSeven = (data: number[]) => data.slice(0, 7);

  const data = {
    labels: ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago', '6 Days Ago'],
    datasets: [
      {
        label: 'New Users',
        data: getLastSeven(stats.newUsersData),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Completed Tasks',
        data: getLastSeven(stats.completedTasksData),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Statistics Over the Last 7 Days' },
    },
  };

  return (
    <div className={`rounded-lg shadow-lg transition-transform transform hover:scale-101 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} p-6`}>
      <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} mb-4`}>Statistics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`p-4 rounded-lg shadow ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
          <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>{stats.totalUsers}</h3>
          <p className="text-gray-500">Total Users</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
          <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>{stats.newUsers}</h3>
          <p className="text-gray-500">New Users (Last 7 Days)</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
          <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>{stats.totalTasks}</h3>
          <p className="text-gray-500">Total Tasks</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
          <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>{stats.completedTasks}</h3>
          <p className="text-gray-500">Completed Tasks (Last 7 Days)</p>
        </div>
      </div>
      <div className="mt-6">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
});

export default Statistics;
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatisticsProps {
  totalUsers: number;
  newUsers: number;
  totalTasks: number;
  completedTasks: number;
  newUsersData: number[]; // Array of new users for the last 7 days
  completedTasksData: number[]; // Array of completed tasks for the last 7 days
}

const Statistics: React.FC<StatisticsProps> = ({
  totalUsers,
  newUsers,
  totalTasks,
  completedTasks,
  newUsersData,
  completedTasksData,
}) => {
  const [stats, setStats] = useState<StatisticsProps | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/get-stats');
      const data = await response.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  const getLastSeven = (data: number[]) => {
    return data.slice(-7).filter((value) => value !== null);
  };

  const filteredNewUsersData = stats ? getLastSeven(stats.newUsersData) : getLastSeven(newUsersData);
  const filteredCompletedTasksData = stats ? getLastSeven(stats.completedTasksData) : getLastSeven(completedTasksData);

  const newUsersDataToDisplay = filteredNewUsersData.reverse();
  const completedTasksDataToDisplay = filteredCompletedTasksData.reverse();

  const data = {
    labels: ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago', '6 Days Ago'],
    datasets: [
      {
        label: 'New Users',
        data: newUsersDataToDisplay,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Completed Tasks',
        data: completedTasksDataToDisplay,
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
        text: 'Statistics Over the Last 7 Days',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-101">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-700">{totalUsers}</h3>
          <p className="text-gray-500">Total Users</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-700">{newUsers}</h3>
          <p className="text-gray-500">New Users (Last 7 Days)</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-700">{totalTasks}</h3>
          <p className="text-gray-500">Total Tasks</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-700">{completedTasks}</h3>
          <p className="text-gray-500">Completed Tasks (Last 7 Days)</p>
        </div>
      </div>
      <div className="mt-6">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Statistics;
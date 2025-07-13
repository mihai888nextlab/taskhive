import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpensePieChartProps {
  data: { [category: string]: number };
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = React.memo(({ data }) => {
  const categories = Object.keys(data);
  const values = Object.values(data);
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF',
  ];

  // Memoize chartData
  const chartData = useMemo(() => ({
    labels: categories,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, categories.length),
        borderWidth: 0,
      },
    ],
  }), [categories, values]);

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    cutout: '0%',
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-48">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
});

export default ExpensePieChart;

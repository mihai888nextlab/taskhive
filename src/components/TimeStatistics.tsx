// src/components/TimeStatistics.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TimeStatisticsProps {
    last7DaysHours: number[]; // Array of hours worked for the last 7 days
}

const TimeStatistics: React.FC<TimeStatisticsProps> = ({ last7DaysHours }) => {
    const data = {
        labels: ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago', '6 Days Ago'],
        datasets: [
            {
                label: 'Hours Worked',
                data: last7DaysHours,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
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
                text: 'Hours Worked Over the Last 7 Days',
            },
        },
    };

    return (
        <div className="mt-6">
            <Bar data={data} options={options} />
        </div>
    );
};

export default TimeStatistics;
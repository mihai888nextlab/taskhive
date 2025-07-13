// src/components/TimeStatistics.tsx
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTranslations } from "next-intl";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TimeStatisticsProps {
    last7DaysHours: number[]; // Array of hours worked for the last 7 days
    hideHeader?: boolean;
    hideSummary?: boolean;
    className?: string;
}

const TimeStatistics: React.FC<TimeStatisticsProps> = React.memo(({ last7DaysHours, hideHeader, hideSummary, className }) => {
    const t = useTranslations("InsightsPage");

    // Memoize chart data
    const data = useMemo(() => ({
        labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
        datasets: [
            {
                label: 'Hours Worked',
                data: last7DaysHours,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
            },
        ],
    }), [last7DaysHours]);

    return (
        <div className={className ? className : ''}>
            {!hideHeader && <h2 className="font-semibold mb-2">{t("hoursWorked")}</h2>}
            {!hideSummary && (
                <div className="mb-2 text-sm">{t("timeTracked")}: <b>{last7DaysHours.reduce((a,b)=>a+b,0).toFixed(1)}</b></div>
            )}
            <div className="h-[320px]">
                <Bar 
                    data={data} 
                    options={{ 
                        responsive: true, 
                        plugins: { 
                            legend: { display: false }, 
                            title: { display: false } 
                        }, 
                        maintainAspectRatio: false 
                    }} 
                />
            </div>
        </div>
    );
});

export default React.memo(TimeStatistics);
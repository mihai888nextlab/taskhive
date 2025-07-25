import React from 'react';
import TimeStatistics from '../TimeStatistics';
import TaskStatistics from '../TaskStatistics';

interface TimeAndTasksProps {
  theme: string;
  t: (key: string) => string;
  last7DaysHours: number[];
  taskStats: { completed: number; total: number; last7Days: number[] };
  memoTaskStats: number[];
}

export default function TimeAndTasks({ theme, t, last7DaysHours, taskStats, memoTaskStats }: TimeAndTasksProps) {
  return (
    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-16 min-h-[380px] flex flex-col justify-center border`}>
        <h2 className={`font-bold text-2xl mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("hoursWorked")}</h2>
        <TimeStatistics 
          last7DaysHours={last7DaysHours} 
          hideHeader 
          hideSummary 
          className="h-[320px]"
        />
      </div>
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-16 min-h-[380px] flex flex-col justify-center border`}>
        <h2 className={`font-bold text-2xl mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("taskStatistics")}</h2>
        <div className={`mb-4 text-lg font-medium flex flex-wrap items-center gap-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          <span>{t("totalTasks")}: <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{taskStats.total}</span></span>
          <span className="hidden md:inline">|</span>
          <span>{t("completed")}: <span className="font-bold text-green-700">{taskStats.completed}</span></span>
        </div>
        <div className="w-full">
          <TaskStatistics 
            completed={taskStats.completed} 
            total={taskStats.total} 
            last7Days={memoTaskStats} 
            hideHeader 
            hideSummary 
            className="h-[320px]"
          />
        </div>
      </div>
    </div>
  );
}

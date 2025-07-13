import React, { useEffect, useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { useTheme } from '@/components/ThemeContext';
import CalendarPanel from "@/components/calendar/CalendarPanel";
import CalendarEventsList from "@/components/calendar/CalendarEventsList";
import "react-calendar/dist/Calendar.css";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const CalendarPage: NextPageWithLayout = React.memo(() => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleDateChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks.");
      }
      let data: Task[] = await response.json();
      data.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return dateA - dateB;
      });
      setTasks(data);
      localStorage.setItem("userTasks", JSON.stringify(data));
    } catch (err) {
      setListError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskDrop = useCallback(async (taskId: string, date: Date) => {
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: date }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task deadline.");
      }
      await fetchTasks();
    } catch (err) {
      setListError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  // Memoize deadlines
  const deadlines = useMemo(() => tasks.map(task => new Date(task.deadline).toDateString()), [tasks]);

  return (
    <div className={`bg-${theme === 'light' ? 'white' : 'gray-900'} text-${theme === 'light' ? 'gray-900' : 'white'}`}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 px-2 sm:px-4 lg:px-6 xl:px-8">
        <main className="flex flex-col lg:flex-row w-full max-w-[2000px] gap-3 sm:gap-4 lg:gap-6 rounded-lg overflow-hidden min-h-[600px] lg:min-h-[700px] bg-transparent">
          {/* Left Panel: Selected Date and Events */}
          <div className="flex flex-col justify-between p-4 sm:p-6 lg:p-6 xl:p-8 bg-gray-800 text-white rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none flex-1 lg:flex-[1] min-w-0 w-full min-h-[400px] lg:min-h-[500px]">
            <div className="mb-6 lg:mb-8 flex-shrink-0">
              {selectedDate ? (
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-none mb-2 sm:mb-3 lg:mb-4">
                    {selectedDate.getDate()}
                  </h1>
                  <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 lg:mb-4">
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                    })}
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-xl xl:text-xl opacity-90">
                    {selectedDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    No Date Selected
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-xl">
                    Please select a date from the calendar.
                  </p>
                </div>
              )}
            </div>
            
            {/* Events list with proper height for scrolling */}
            <div className="flex-1 overflow-hidden min-h-0">
              <CalendarEventsList
                tasks={tasks}
                selectedDate={selectedDate}
                loading={loading}
                listError={listError}
              />
            </div>
          </div>

          {/* Right Panel: Calendar */}
          <div className={`flex-1 lg:flex-[4] p-3 sm:p-4 lg:p-6 xl:p-8 rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none flex justify-center items-center w-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} min-h-[400px] lg:min-h-[500px]`}> 
            <div className="w-full h-full flex items-center justify-center">
              <CalendarPanel
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                deadlines={deadlines}
                theme={theme}
                tasks={tasks}
                onTaskDrop={handleTaskDrop}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
});

CalendarPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default React.memo(CalendarPage);
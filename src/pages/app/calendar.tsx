import React, { useEffect, useState } from "react";
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

const CalendarPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const fetchTasks = async () => {
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
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskDrop = async (taskId: string, date: Date) => {
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
  };

  const deadlines = tasks.map(task => new Date(task.deadline).toDateString());

  return (
    <div className={`bg-${theme === 'light' ? 'white' : 'gray-900'} text-${theme === 'light' ? 'gray-900' : 'white'}`}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-2 sm:p-4 md:p-8 bg-gray-100">
        <main className="flex flex-col md:flex-row w-full max-w-[1400px] gap-2 sm:gap-4 md:gap-8 rounded-none sm:rounded-lg shadow-xl overflow-hidden min-h-[500px] md:min-h-[700px] bg-transparent">
          {/* Left Panel: Selected Date and Events */}
          <div className="flex flex-col justify-between p-3 sm:p-6 md:p-8 bg-gray-800 text-white rounded-t-xl md:rounded-l-xl md:rounded-tr-none flex-1 min-w-0 w-full min-h-[320px] sm:min-h-[400px]">
            <div>
              {selectedDate ? (
                <div>
                  <h1 className="text-3xl sm:text-6xl md:text-8xl font-bold leading-none mb-1 sm:mb-2">
                    {selectedDate.getDate()}
                  </h1>
                  <h2 className="text-lg sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2">
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                    })}
                  </h2>
                  <p className="text-base sm:text-xl md:text-2xl opacity-90">
                    {selectedDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl sm:text-4xl font-bold">
                    No Date Selected
                  </h1>
                  <p className="text-base sm:text-2xl">
                    Please select a date from the calendar.
                  </p>
                </div>
              )}
            </div>
            <CalendarEventsList
              tasks={tasks}
              selectedDate={selectedDate}
              loading={loading}
              listError={listError}
            />
          </div>
          {/* Right Panel: Calendar */}
          <div className={`flex-3 p-2 sm:p-6 md:p-8 rounded-b-xl md:rounded-r-xl md:rounded-bl-none flex justify-center items-center w-full overflow-x-auto ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} min-h-[320px] sm:min-h-[400px]`}> 
            <div className="w-full max-w-full overflow-x-auto">
              <CalendarPanel
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                deadlines={deadlines}
                theme={theme}
                onTaskDrop={handleTaskDrop}
              />
            </div>
          </div>
        </main>
        {/* Keep your global styles for react-calendar here */}
        <style jsx global>{`
          @media (max-width: 640px) {
            .react-calendar-light-theme {
              padding: 0.5rem !important;
              max-width: 100vw;
              min-width: 0;
            }
            .react-calendar-light-theme .react-calendar__tile {
              width: 36px;
              height: 36px;
              font-size: 1rem;
            }
            .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
              width: 32px;
              height: 32px;
              font-size: 1rem;
            }
            .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
              font-size: 0.85rem;
              padding: 0.5rem 0;
            }
            .react-calendar-light-theme .react-calendar__navigation__label {
              font-size: 1.1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

CalendarPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CalendarPage;
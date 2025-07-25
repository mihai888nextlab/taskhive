import React from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import CalendarPanel from "@/components/calendar/CalendarPanel";
import CalendarEventsList from "@/components/calendar/CalendarEventsList";
import { useCalendarPage } from "@/hooks/useCalendar";
import { NextPageWithLayout } from "@/types";

interface AnnouncementEvent {
  _id: string;
  title: string;
  eventDate: string;
  category: string;
  content?: string;
}

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
  const {
    theme,
    selectedDate,
    setSelectedDate,
    loading,
    setLoading,
    listError,
    setListError,
    tasks,
    setTasks,
    announcementEvents,
    setAnnouncementEvents,
    fetchAnnouncementEvents,
    handleDateChange,
    fetchTasks,
    handleTaskDrop,
    deadlines,
    eventDates,
  } = useCalendarPage();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  const CalendarPanelSection = (
    <div className={`flex-1 lg:flex-[4] p-3 sm:p-4 lg:p-6 xl:p-8 rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none flex justify-center items-center w-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} min-h-[400px] lg:min-h-[500px]`}>
      <div className="w-full h-full flex items-center justify-center">
        <CalendarPanel
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          deadlines={[...deadlines, ...eventDates]}
          theme={theme}
          tasks={tasks}
          announcementEvents={announcementEvents}
          onTaskDrop={handleTaskDrop}
        />
      </div>
    </div>
  );

  const EventsListSection = (
    <div className={`flex flex-col justify-between p-4 sm:p-6 lg:p-6 xl:p-8 rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none flex-1 lg:flex-[1] min-w-0 w-full min-h-[400px] lg:min-h-[500px] ${theme === 'dark' ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}>
      <div className="mb-6 lg:mb-8 flex-shrink-0">
        {selectedDate ? (
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-none mb-2 sm:mb-3 lg:mb-4">
              {selectedDate.getDate()}
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 lg:mb-4">
              {selectedDate.toLocaleDateString(undefined, { weekday: "long" })}
            </h2>
            <p className="text-lg sm:text-xl lg:text-xl xl:text-xl opacity-90">
              {selectedDate.toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">No Date Selected</h1>
            <p className="text-lg sm:text-xl lg:text-xl">Please select a date from the calendar.</p>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <CalendarEventsList
          tasks={tasks}
          selectedDate={selectedDate}
          loading={loading}
          listError={listError}
          announcementEvents={announcementEvents}
        />
      </div>
    </div>
  );

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-2 sm:px-4 lg:px-6 xl:px-8">
        <main className="flex flex-col lg:flex-row w-full max-w-[2000px] gap-3 sm:gap-4 lg:gap-6 rounded-lg overflow-hidden min-h-[600px] lg:min-h-[700px] bg-transparent">
          {isMobile ? (
            <>
              {CalendarPanelSection}
              {EventsListSection}
            </>
          ) : (
            <>
              {EventsListSection}
              {CalendarPanelSection}
            </>
          )}
        </main>
      </div>
    </div>
  );
});

CalendarPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default React.memo(CalendarPage);
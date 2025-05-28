import React, { useState } from "react";
import Calendar from "react-calendar";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import "react-calendar/dist/Calendar.css";

const CalendarPage: NextPageWithLayout = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    // The main container for the calendar layout, filling the dashboard content area
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-2 sm:p-4 md:p-8 bg-gray-100">
      {/* Main content wrapper with responsive flex direction */}
      <main className="flex flex-col md:flex-row w-full max-w-[1400px] gap-4 md:gap-8 rounded-lg shadow-xl overflow-hidden min-h-[500px] md:min-h-[700px]">
        {/* Left Panel: Selected Date and Events */}
        <div className="flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-gray-800 text-white rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex-1 min-w-0 w-full">
          <div>
            {selectedDate ? (
              <div>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-none mb-2">
                  {selectedDate.getDate()}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                  })}
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl opacity-90">
                  {selectedDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold">No Date Selected</h1>
                <p className="text-lg sm:text-2xl">Please select a date from the calendar.</p>
              </div>
            )}
          </div>
          {/* Placeholder for events list */}
          <div className="mt-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 border-b border-white border-opacity-30 pb-2">
              Upcoming Events
            </h3>
            <ul className="space-y-3">
              <li className="text-base sm:text-lg opacity-90">No events for this date.</li>
            </ul>
          </div>
        </div>
        {/* Right Panel: Calendar */}
        <div className="flex-3 bg-white p-4 sm:p-6 md:p-8 rounded-b-lg md:rounded-r-lg md:rounded-bl-none flex justify-center items-center w-full overflow-x-auto">
          <Calendar
            onChange={(val, e) => {
              if (val instanceof Date) {
                handleDateChange(val);
              } else {
                handleDateChange(null);
              }
            }}
            value={selectedDate}
            showNeighboringMonth={false}
            className="border-none !bg-white text-gray-800 p-2 sm:p-4"
            tileClassName={({ date, view }) => {
              if (view === "month") {
                const day = date.getDay();
                const isSelected =
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString();
                let classes =
                  "flex items-center justify-center rounded-md !w-10 !h-10 sm:!w-12 sm:!h-12 text-base sm:text-lg font-medium";
                if (isSelected) {
                  classes += " bg-blue-600 text-white";
                } else if (day === 0 || day === 6) {
                  classes += " text-red-500";
                } else {
                  classes += " text-gray-800";
                }
                return classes;
              }
              return null;
            }}
            navigationLabel={({ date, label }) => (
              <span className="font-bold text-blue-600 text-lg sm:text-xl">{label}</span>
            )}
            navigationAriaLabel="Navigate"
            next2Label={null}
            prev2Label={null}
            nextLabel={
              <span className="text-blue-600 text-xl sm:text-2xl font-bold">›</span>
            }
            prevLabel={
              <span className="text-blue-600 text-xl sm:text-2xl font-bold">‹</span>
            }
          />
        </div>
      </main>
    </div>
  );
};

// Assign the layout to the page
CalendarPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CalendarPage;

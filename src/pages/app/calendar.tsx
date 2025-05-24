import React, { useState } from "react";
import Calendar from "react-calendar";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import "react-calendar/dist/Calendar.css"; // Keep this for base styles, we'll override with Tailwind

const CalendarPage: NextPageWithLayout = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Initialize with current date

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    // The main container for the calendar layout, filling the dashboard content area
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-8 bg-gray-100">
      {/* Main content wrapper with fixed width and shadow */}
      {/* Retaining the previous max-w for the overall container, as the calendar's internal width will be set */}
      <main className="flex w-full max-w-[1400px] gap-8 rounded-lg shadow-xl overflow-hidden min-h-[700px]">

        {/* Left Panel: Selected Date and Events */}
        <div className="flex flex-col justify-between p-8 bg-gray-800 text-white rounded-l-lg flex-1 min-w-[350px]">
          <div>
            {selectedDate ? (
              <div>
                <h1 className="text-8xl font-bold leading-none mb-2">
                  {selectedDate.getDate()}
                </h1>
                <h2 className="text-4xl font-bold mb-2">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                  })}
                </h2>
                <p className="text-2xl opacity-90">
                  {selectedDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-bold">No Date Selected</h1>
                <p className="text-2xl">Please select a date from the calendar.</p>
              </div>
            )}
          </div>

          {/* Placeholder for events list */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 border-b border-white border-opacity-30 pb-2">
              Upcoming Events
            </h3>
            <ul className="space-y-3">
              <li className="text-lg opacity-90">No events for this date.</li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Calendar */}
        {/* Retaining flex-3 here as it distributes the space, but the Calendar component inside will have a fixed width */}
        <div className="flex-3 bg-white p-8 rounded-r-lg flex justify-center items-center">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            showNeighboringMonth={false}
            // Custom styling for react-calendar
            // Set a fixed width for the calendar component itself
            className="border-none !bg-white text-gray-800 p-4"
            style={{ width: '500px', maxWidth: '100%', height: 'auto' }} // Explicit width, ensure it's responsive
            // Custom day rendering to apply blue and red highlights
            tileClassName={({ date, view }) => {
              if (view === "month") {
                const day = date.getDay(); // 0 for Sunday, 6 for Saturday
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                // Adjusted tile size for a more compact calendar look as seen in image_191dd6.png
                let classes = "flex items-center justify-center rounded-md !w-12 !h-12 text-lg font-medium";

                if (isSelected) {
                  // Blue background for selected date, matching image_6065f0.png and image_607135.png
                  classes += " bg-blue-600 text-white";
                } else if (day === 0 || day === 6) {
                  // Red text for weekends
                  classes += " text-red-500";
                } else {
                  // Default text color for weekdays
                  classes += " text-gray-800";
                }

                return classes;
              }
              return null;
            }}
            // Navigation labels (Month Year)
            navigationLabel={({ date, label }) => (
              <span className="font-bold text-blue-600 text-xl">
                {label}
              </span>
            )}
            // Navigation buttons
            navigationAriaLabel="Navigate"
            next2Label={null}
            prev2Label={null}
            nextLabel={<span className="text-blue-600 text-2xl font-bold">›</span>}
            prevLabel={<span className="text-blue-600 text-2xl font-bold">‹</span>}
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
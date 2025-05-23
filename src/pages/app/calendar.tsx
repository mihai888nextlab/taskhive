import React, { useState } from "react";
import Calendar from "react-calendar";
import DashboardLayout from "@/components/DashboardLayout"; // Import the shared layout
import { NextPageWithLayout } from "@/types"; // Import the layout type
import "react-calendar/dist/Calendar.css"; // Import the default calendar styles

const CalendarPage: NextPageWithLayout = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div
      style={{
        minWidth: "100%",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6", // Light gray background for the entire page
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: "1200px", // Limit the width for better readability
          display: "flex",
          gap: "32px", // Space between the left and right panels
          borderRadius: "16px", // Rounded corners for the entire layout
          overflow: "hidden", // Ensure content stays within rounded corners
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
          minHeight: "800px",
        }}
      >
        {/* Left Panel: Selected Date and Events */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#1f2937",
            color: "#ffffff", // White text color
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "32px",
          }}
        >
          {/* Selected Date */}
          <div>
            {selectedDate ? (
              <div>
                <h1
                  style={{
                    fontSize: "5rem", // Large font size for the date
                    fontWeight: "bold",
                    margin: "0",
                  }}
                >
                  {selectedDate.getDate()}
                </h1>
                <h2
                  style={{
                    fontSize: "2rem", // Font size for the day
                    fontWeight: "bold",
                    margin: "0",
                  }}
                >
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                  })}
                </h2>
                <p
                  style={{
                    fontSize: "1.4rem", // Font size for the full date
                    marginTop: "8px",
                  }}
                >
                  {selectedDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            ) : (
              <div>
                <h1
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  No Date Selected
                </h1>
                <p
                  style={{
                    fontSize: "1.4rem",
                  }}
                >
                  Please select a date from the calendar.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Calendar */}
        <div
          style={{
            flex: 2,
            backgroundColor: "#ffffff", // White background for the calendar
            padding: "32px",
            borderRadius: "16px", // Rounded corners
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            showNeighboringMonth={false} // Disable smaller dates from neighboring months
            style={{
              width: "100%", // Calendar fills its flex container
              border: "none", // Remove default border
              borderRadius: "16px", // Rounded corners
              padding: "10px", // Padding inside the calendar
              backgroundColor: "#f9fafb", // Light gray background for the calendar
              fontSize: "1.6rem", // Font size for calendar text
            }}
            navigationLabel={({ date, label }) => (
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "1.8rem", // Font size for navigation label
                  color: "#2563eb", // Theme primary color
                }}
              >
                {label}
              </span>
            )}
            navigationAriaLabel="Navigate"
            next2Label={null}
            prev2Label={null}
            nextLabel="›"
            prevLabel="‹"
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
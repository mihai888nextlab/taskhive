import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import "react-calendar/dist/Calendar.css"; // Keep this for base styles
import Link from "next/link";
import { useTheme } from '@/components/ThemeContext'; // Import the useTheme hook
// Removed unused DatePicker imports as they are not used in the provided code
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

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
  const { theme } = useTheme(); // Get the current theme
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  // taskDeadline state is not used, can be removed if not needed for other logic
  // const [taskDeadline, setTaskDeadline] = useState<string | null>(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const fetchTasks = async () => {
    setLoading(true);
    setListError(null); // Clear previous list errors
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks.");
      }
      let data: Task[] = await response.json();

      // --- REVISED SORTING LOGIC FOR TASKS PAGE (Sort by Deadline, then push completed to end) ---
      data.sort((a, b) => {
        // Prioritize by completion status: incomplete tasks first
        if (a.completed && !b.completed) return 1; // 'a' is completed, 'b' is not: 'a' goes after 'b'
        if (!a.completed && b.completed) return -1; // 'a' is not completed, 'b' is: 'a' goes before 'b'

        // If both are completed or both are incomplete, sort by deadline
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return dateA - dateB; // Ascending order (earliest deadline first)
      });
      // --- END REVISED SORTING LOGIC ---

      setTasks(data);
      localStorage.setItem("userTasks", JSON.stringify(data)); // <-- Store in localStorage
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setListError((err as Error).message); // Set list-specific error
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Get deadlines for highlighting
  const deadlines = tasks.map(task => new Date(task.deadline).toDateString());

  return (
    <div className={`bg-${theme === 'light' ? 'white' : 'gray-900'} text-${theme === 'light' ? 'gray-900' : 'white'}`}>
      {/* The main container for the calendar layout, filling the dashboard content area */}
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
                  <h1 className="text-2xl sm:text-4xl font-bold">
                    No Date Selected
                  </h1>
                  <p className="text-lg sm:text-2xl">
                    Please select a date from the calendar.
                  </p>
                </div>
              )}
            </div>
            {/* Placeholder for events list */}
            <div className="mt-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 border-b border-white border-opacity-30 pb-2">
                Upcoming Events
              </h3>
              <ul className="space-y-3">
                {loading ? (
                  <li className="text-gray-400">Loading events...</li>
                ) : listError ? (
                  <li className="text-red-500">{listError}</li>
                ) : selectedDate ? (
                  (() => {
                    const eventsForDate = tasks.filter(
                      (task) =>
                        new Date(task.deadline).toDateString() ===
                        selectedDate.toDateString()
                    );
                    if (eventsForDate.length === 0) {
                      return (
                        <li className="text-gray-400">No upcoming events.</li>
                      );
                    }
                    return eventsForDate.map((task) => (
                      <Link key={task._id} href={`/app/tasks/`}>
                        <li
                          className={`p-3 rounded-lg ${
                            task.completed
                              ? "bg-gray-700 opacity-70"
                              : "bg-gray-800 hover:bg-gray-700"
                          } transition-colors`}
                        >
                          <h4 className="font-semibold text-lg">
                            {task.title}{" "}
                            {task.completed && (
                              <span className="text-green-400">(Completed)</span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-300">
                            {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        </li>
                      </Link>
                    ));
                  })()
                ) : (
                  <li className="text-gray-400">No upcoming events.</li>
                )}
              </ul>
            </div>
          </div>
          {/* Right Panel: Calendar */}
          <div className={`flex-3 p-4 sm:p-6 md:p-8 rounded-b-lg md:rounded-r-lg md:rounded-bl-none flex justify-center items-center w-full overflow-x-auto ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <Calendar
              onChange={(val) => handleDateChange(val instanceof Date ? val : null)}
              value={selectedDate}
              // Apply a custom class for overall calendar styling to match the dark theme
              className="border-none !bg-white text-gray-800 p-2 sm:p-4 react-calendar-light-theme"
              // Apply a custom class to tiles that are deadlines
              tileClassName={({ date, view }) => {
                if (view === 'month' && deadlines.includes(date.toDateString())) {
                  return 'highlight-deadline'; // This class will be used in global CSS
                }
                return null;
              }}
              tileContent={({ date, view }) => {
                // Only apply custom styling for 'month' view and if it's a deadline
                if (view === 'month' && deadlines.includes(date.toDateString())) {
                  // This div will be the circular highlight
                  return (
                    <div
                      className="highlight-circle-content" // Apply a class for styling this inner div
                      style={{
                        backgroundColor: '#4A90E2', // Highlight color
                        color: 'white', // Text color for our custom date
                      }}
                    >
                      {date.getDate()} {/* The date number is now rendered inside our custom div */}
                    </div>
                  );
                }
                return null; // For non-deadline dates or other views, let react-calendar render default
              }}
              navigationLabel={({ date, label }) => (
                <span className="font-bold text-blue-600 text-lg sm:text-xl">{label}</span>
              )}
              nextLabel={<span className="text-blue-600 text-xl sm:text-2xl font-bold">›</span>}
              prevLabel={<span className="text-blue-600 text-xl sm:text-2xl font-bold">‹</span>}
            />
          </div>
        </main>

        {/* Global Style to hide the default date number on highlighted tiles and apply light theme */}
        <style jsx global>{`
          /* Hide the default date number on highlighted tiles */
          .react-calendar__tile.highlight-deadline abbr {
            display: none;
          }

          /* Overall calendar container styling */
          .react-calendar-light-theme {
            background-color: #fff !important; /* White background */
            border-radius: 0.5rem; /* rounded-lg */
            font-family: 'Inter', sans-serif; /* Consistent font */
            width: 100%; /* Ensure it takes full width of its container */
            max-width: 800px; /* Increased max width for a larger calendar */
            padding: 3rem !important; /* Increased padding */
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
          }

          /* Navigation buttons */
          .react-calendar-light-theme .react-calendar__navigation button {
            background: none !important;
            color: #333; /* Darker color for light theme */
            min-width: 60px; /* Further larger buttons */
            font-size: 2.5rem; /* Increased font size */
            border-radius: 0.5rem;
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
          }

          .react-calendar-light-theme .react-calendar__navigation button:enabled:hover,
          .react-calendar-light-theme .react-calendar__navigation button:enabled:focus {
            background-color: #e6e6e6 !important; /* Light gray hover */
            color: #000; /* Blacker text on hover */
          }

          /* Month/Year labels */
          .react-calendar-light-theme .react-calendar__navigation__label {
            background: none !important;
            color: #0000ff !important; /* Original blue */
            font-weight: bold;
            font-size: 2rem; /* Increased font size */
          }

          /* Weekday headers */
          .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
            color: #666; /* Slightly darker gray for light theme */
            font-size: 1.35rem; /* Increased font size */
            text-transform: uppercase;
            font-weight: 600;
            padding: 1.3rem 0; /* Increased padding */
          }

          /* Tiles (dates) - ALL DATES HAVE THESE DIMENSIONS AND ARE CENTERED */
          .react-calendar-light-theme .react-calendar__tile {
            background: none;
            color: #333; /* Darker text for light theme */
            border-radius: 0.5rem;
            padding: 0; /* Remove padding as width/height will control size */
            font-size: 1.5rem; /* Consistent font size for all dates */
            width: 55px; /* Increased fixed width for all date tiles */
            height: 55px; /* Increased fixed height for all date tiles */
            display: flex; /* Use flexbox to center content */
            align-items: center; /* Center vertically */
            justify-content: center; /* Center horizontally */
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
            position: relative; /* Needed for positioning the inner highlight circle */
          }

          .react-calendar-light-theme .react-calendar__tile:enabled:hover,
          .react-calendar-light-theme .react-calendar__tile:enabled:focus {
            background-color: #f0f0f0; /* Lighter gray hover */
            color: #000; /* Blacker text on hover */
          }

          /* Selected date */
          .react-calendar-light-theme .react-calendar__tile--active {
            background-color: #007bff !important; /* Bootstrap primary blue or similar */
            color: white !important;
            border-radius: 0.5rem;
          }

          /* Today's date */
          .react-calendar-light-theme .react-calendar__tile--now {
            background-color: #e0e0e0; /* Light gray for today */
            color: #333;
            border-radius: 0.5rem;
          }

          .react-calendar-light-theme .react-calendar__tile--now:enabled:hover,
          .react-calendar-light-theme .react-calendar__tile--now:enabled:focus {
            background-color: #d0d0d0; /* Slightly darker gray on hover */
          }

          /* Neighboring month dates */
          .react-calendar-light-theme .react-calendar__month-view__days__day--neighboringMonth {
            color: #aaa; /* Lighter gray for neighboring months */
          }

          /* Styling for the inner highlight circle */
          .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
              width: 50px; /* Adjusted to be slightly smaller than tile for perfect circle */
              height: 50px; /* Must be equal to width for perfect circle */
              border-radius: 50%; /* Make it perfectly circular */
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem; /* Consistent font size for date number inside highlight */
              position: absolute; /* Position absolutely within the tile */
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%); /* Center it precisely */
              z-index: 2; /* Ensure it's on top of other content */
          }

          /* Hover effect for highlighted tiles */
          .react-calendar-light-theme .react-calendar__tile.highlight-deadline:enabled:hover .highlight-circle-content,
          .react-calendar-light-theme .react-calendar__tile.highlight-deadline:enabled:focus .highlight-circle-content {
              background-color: #3a7bd5 !important; /* Slightly darker blue on hover for highlighted circle */
          }
        `}</style>
      </div>
    </div>
  );
};

// Assign the layout to the page
CalendarPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CalendarPage;

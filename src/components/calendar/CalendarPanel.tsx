import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface CalendarPanelProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  deadlines: string[];
  theme: string;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({
  selectedDate,
  onDateChange,
  deadlines,
  theme,
}) => (
  <div className="w-full flex justify-center items-center">
    <Calendar
      onChange={(val) => onDateChange(val instanceof Date ? val : null)}
      value={selectedDate}
      className="border-none !bg-white text-gray-800 p-2 sm:p-4 react-calendar-light-theme"
      tileClassName={({ date, view }) => {
        if (view === 'month' && deadlines.includes(date.toDateString())) {
          return 'highlight-deadline';
        }
        return null;
      }}
      tileContent={({ date, view }) => {
        if (view === 'month' && deadlines.includes(date.toDateString())) {
          return (
            <div
              className="highlight-circle-content"
              style={{
                backgroundColor: '#4A90E2',
                color: 'white',
              }}
            >
              {date.getDate()}
            </div>
          );
        }
        return null;
      }}
      navigationLabel={({ date, label }) => (
        <span className="font-bold text-blue-600 text-lg sm:text-xl">{label}</span>
      )}
      nextLabel={<span className="text-blue-600 text-xl sm:text-2xl font-bold">›</span>}
      prevLabel={<span className="text-blue-600 text-xl sm:text-2xl font-bold">‹</span>}
    />
    {/* Global Style to match the page's calendar style */}
    <style jsx global>{`
      .react-calendar__tile.highlight-deadline abbr {
        display: none;
      }
      .react-calendar-light-theme {
        background-color: #fff !important;
        border-radius: 0.5rem;
        font-family: 'Inter', sans-serif;
        width: 100%;
        max-width: 800px;
        padding: 3rem !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .react-calendar-light-theme .react-calendar__navigation button {
        background: none !important;
        color: #333;
        min-width: 60px;
        font-size: 2.5rem;
        border-radius: 0.5rem;
        transition: background-color 0.2s, color 0.2s;
      }
      .react-calendar-light-theme .react-calendar__navigation button:enabled:hover,
      .react-calendar-light-theme .react-calendar__navigation button:enabled:focus {
        background-color: #e6e6e6 !important;
        color: #000;
      }
      .react-calendar-light-theme .react-calendar__navigation__label {
        background: none !important;
        color: #0000ff !important;
        font-weight: bold;
        font-size: 2rem;
      }
      .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
        color: #666;
        font-size: 1.35rem;
        text-transform: uppercase;
        font-weight: 600;
        padding: 1.3rem 0;
      }
      .react-calendar-light-theme .react-calendar__tile {
        background: none;
        color: #333;
        border-radius: 0.5rem;
        padding: 0;
        font-size: 1.5rem;
        width: 55px;
        height: 55px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s, color 0.2s;
        position: relative;
      }
      .react-calendar-light-theme .react-calendar__tile:enabled:hover,
      .react-calendar-light-theme .react-calendar__tile:enabled:focus {
        background-color: #f0f0f0;
        color: #000;
      }
      .react-calendar-light-theme .react-calendar__tile--active {
        background-color: #007bff !important;
        color: white !important;
        border-radius: 0.5rem;
      }
      .react-calendar-light-theme .react-calendar__tile--now {
        background-color: #e0e0e0;
        color: #333;
        border-radius: 0.5rem;
      }
      .react-calendar-light-theme .react-calendar__tile--now:enabled:hover,
      .react-calendar-light-theme .react-calendar__tile--now:enabled:focus {
        background-color: #d0d0d0;
      }
      .react-calendar-light-theme .react-calendar__month-view__days__day--neighboringMonth {
        color: #aaa;
      }
      .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      }
      .react-calendar-light-theme .react-calendar__tile.highlight-deadline:enabled:hover .highlight-circle-content,
      .react-calendar-light-theme .react-calendar__tile.highlight-deadline:enabled:focus .highlight-circle-content {
        background-color: #3a7bd5 !important;
      }
    `}</style>
  </div>
);

export default CalendarPanel;
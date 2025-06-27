import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface CalendarPanelProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  deadlines: string[];
  theme: string;
  onTaskDrop?: (taskId: string, date: Date) => void; // New prop
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({
  selectedDate,
  onDateChange,
  deadlines,
  theme,
  onTaskDrop,
}) => {
  return (
    <div className="w-full flex justify-center items-center overflow-x-auto">
      <Calendar
        onChange={(val) => onDateChange(val instanceof Date ? val : null)}
        value={selectedDate}
        className="border-none !bg-white text-gray-800 p-2 sm:p-4 react-calendar-light-theme w-full max-w-full"
        tileClassName={({ date, view }) => {
          if (view === 'month' && deadlines.includes(date.toDateString())) {
            return 'highlight-deadline';
          }
          return null;
        }}
        tileContent={({ date, view }) => {
          // Keep your highlight logic
          const highlight = view === 'month' && deadlines.includes(date.toDateString());
          return (
            <>
              {highlight && (
                <div
                  className="highlight-circle-content"
                  style={{
                    backgroundColor: '#4A90E2',
                    color: 'white',
                  }}
                >
                  {date.getDate()}
                </div>
              )}
              {/* Invisible overlay for drag-and-drop */}
              <div
                style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer', background: 'transparent' }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={e => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (onTaskDrop && taskId) {
                    onTaskDrop(taskId, date);
                  }
                }}
              />
            </>
          );
        }}
        navigationLabel={({ date, label }) => (
          <span className="font-bold text-blue-600 text-base sm:text-lg">{label}</span>
        )}
        nextLabel={<span className="text-blue-600 text-lg sm:text-2xl font-bold">›</span>}
        prevLabel={<span className="text-blue-600 text-lg sm:text-2xl font-bold">‹</span>}
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
          min-width: 40px;
          font-size: 1.5rem;
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
          font-size: 1.2rem;
        }
        .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
          color: #666;
          font-size: 1rem;
          text-transform: uppercase;
          font-weight: 600;
          padding: 0.7rem 0;
        }
        .react-calendar-light-theme .react-calendar__tile {
          background: none;
          color: #333;
          border-radius: 0.5rem;
          padding: 0;
          font-size: 1rem;
          width: 36px;
          height: 36px;
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
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
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
        @media (max-width: 640px) {
          .react-calendar-light-theme {
            padding: 0.5rem !important;
            min-width: 340px;
            max-width: 100vw;
          }
          .react-calendar-light-theme .react-calendar__tile {
            width: 32px;
            height: 32px;
            font-size: 0.95rem;
          }
          .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
            width: 28px;
            height: 28px;
            font-size: 0.95rem;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
            font-size: 0.8rem;
            padding: 0.3rem 0;
          }
          .react-calendar-light-theme .react-calendar__navigation__label {
            font-size: 1rem;
          }
        }
        @media (min-width: 641px) {
          .react-calendar-light-theme {
            padding: 2rem !important;
          }
          .react-calendar-light-theme .react-calendar__tile {
            width: 55px;
            height: 55px;
            font-size: 1.5rem;
          }
          .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPanel;
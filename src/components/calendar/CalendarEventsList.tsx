import React from "react";
import Link from "next/link";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
}

interface CalendarEventsListProps {
  tasks: Task[];
  selectedDate: Date | null;
  loading: boolean;
  listError: string | null;
  enableDragAndDrop?: boolean; // Optional, default true
}

const CalendarEventsList: React.FC<CalendarEventsListProps> = ({
  tasks,
  selectedDate,
  loading,
  listError,
  enableDragAndDrop = true,
}) => {
  let eventsForDate: Task[] = [];
  if (selectedDate) {
    eventsForDate = tasks.filter(
      (task) =>
        new Date(task.deadline).toDateString() === selectedDate.toDateString()
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 border-b border-white border-opacity-30 pb-1 sm:pb-2">
        Upcoming Events
      </h3>
      <ul className="space-y-2 sm:space-y-3">
        {loading ? (
          <li className="text-gray-400 text-sm sm:text-base">Loading events...</li>
        ) : listError ? (
          <li className="text-red-500 text-sm sm:text-base">{listError}</li>
        ) : selectedDate ? (
          eventsForDate.length === 0 ? (
            <li className="text-gray-400 text-sm sm:text-base">No upcoming events.</li>
          ) : (
            eventsForDate.map((task) => (
              <Link key={task._id} href={`/app/tasks/`} legacyBehavior>
                <li
                  className={`p-2 sm:p-3 rounded-lg ${
                    task.completed
                      ? "bg-gray-700 opacity-70"
                      : "bg-gray-800 hover:bg-gray-700"
                  } transition-colors cursor-move flex flex-col gap-1`}
                  draggable={enableDragAndDrop}
                  onDragStart={(e) => {
                    if (enableDragAndDrop) {
                      e.dataTransfer.setData("text/plain", task._id);
                    }
                  }}
                >
                  <h4 className="font-semibold text-base sm:text-lg">
                    {task.title}{" "}
                    {task.completed && (
                      <span className="text-green-400 text-xs sm:text-sm">(Completed)</span>
                    )}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-300">
                    {new Date(task.deadline).toLocaleDateString()}
                  </p>
                </li>
              </Link>
            ))
          )
        ) : (
          <li className="text-gray-400 text-sm sm:text-base">No upcoming events.</li>
        )}
      </ul>
    </div>
  );
};

export default CalendarEventsList;
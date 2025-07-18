import React, { useMemo, useCallback } from "react";
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
  enableDragAndDrop?: boolean;
}

const CalendarEventsList: React.FC<CalendarEventsListProps> = React.memo(
  ({
    tasks,
    selectedDate,
    loading,
    listError,
    enableDragAndDrop = true,
  }) => {
    // Memoize eventsForDate
    const eventsForDate: Task[] = useMemo(() => {
      if (!selectedDate) return [];
      return tasks.filter(
        (task) =>
          new Date(task.deadline).toDateString() ===
          selectedDate.toDateString()
      );
    }, [tasks, selectedDate]);

    // Memoize isOverdue
    const isOverdue = useCallback(
      (task: Task) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(task.deadline);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today && !task.completed;
      },
      []
    );

    // Memoize drag handler
    const handleDragStart = useCallback(
      (e: React.DragEvent, taskId: string) => {
        if (enableDragAndDrop) {
          e.dataTransfer.setData("text/plain", taskId);
        }
      },
      [enableDragAndDrop]
    );

    // Memoize events list rendering
    const eventsList = useMemo(() => {
      if (loading) {
        return (
          <li className="text-gray-400 text-sm sm:text-base">
            Loading events...
          </li>
        );
      }
      if (listError) {
        return (
          <li className="text-red-500 text-sm sm:text-base">{listError}</li>
        );
      }
      if (!selectedDate) {
        return (
          <li className="text-gray-400 text-sm sm:text-base">
            No upcoming events.
          </li>
        );
      }
      if (eventsForDate.length === 0) {
        return (
          <li className="text-gray-400 text-sm sm:text-base">
            No upcoming events.
          </li>
        );
      }
      return eventsForDate.map((task) => (
        <Link key={task._id} href={`/app/tasks/`} legacyBehavior>
          <li
            className={`p-2 sm:p-3 rounded-lg ${
              task.completed
                ? "bg-gray-700 opacity-70 hover:bg-gray-700 border-l-2 border-green-400"
                : isOverdue(task)
                ? "bg-gray-700 opacity-70 hover:bg-gray-700 border-l-2 border-red-400"
                : "bg-gray-700 hover:bg-gray-600 border-l-2 border-blue-400"
            } transition-colors cursor-move flex flex-col gap-1`}
            draggable={enableDragAndDrop}
            onDragStart={(e) => handleDragStart(e, task._id)}
          >
            <h4
              className={`font-semibold text-base sm:text-lg ${
                isOverdue(task) ? "text-red-300" : ""
              }`}
            >
              {isOverdue(task) && (
                <span className="text-red-400 text-xs sm:text-sm mr-1">
                  ●
                </span>
              )}
              {task.title}{" "}
              {task.completed && (
                <span className="text-green-400 text-xs sm:text-sm">
                  (Completed)
                </span>
              )}
              {isOverdue(task) && (
                <span className="text-red-400 text-xs sm:text-sm ml-1">
                  (Overdue)
                </span>
              )}
            </h4>
            <p
              className={`text-xs sm:text-sm ${
                isOverdue(task) ? "text-red-200" : "text-gray-300"
              }`}
            >
              {new Date(task.deadline).toLocaleDateString()}
            </p>
          </li>
        </Link>
      ));
    }, [
      loading,
      listError,
      selectedDate,
      eventsForDate,
      enableDragAndDrop,
      handleDragStart,
      isOverdue,
    ]);

    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Fixed header that stays at top */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {/* Spacer to push content to bottom */}
          <div className="flex-1"></div>

          {/* Events content with header directly above */}
          <div className="flex-shrink-0">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 border-b border-white border-opacity-30 pb-1 sm:pb-2">
              Upcoming Events
            </h3>

            <ul className="space-y-2 sm:space-y-3">{eventsList}</ul>
          </div>
        </div>
      </div>
    );
  }
);

export default React.memo(CalendarEventsList);
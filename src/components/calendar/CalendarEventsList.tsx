import React, { useMemo, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
}

interface AnnouncementEvent {
  _id: string;
  title: string;
  eventDate: string;
  category: string;
}

interface CalendarEventsListProps {
  tasks: Task[];
  selectedDate: Date | null;
  loading: boolean;
  listError: string | null;
  enableDragAndDrop?: boolean;
  announcementEvents?: AnnouncementEvent[];
}

const CalendarEventsList: React.FC<CalendarEventsListProps> = React.memo(
  ({
    tasks,
    selectedDate,
    loading,
    listError,
    enableDragAndDrop = true,
  announcementEvents = [],
  }) => {
    const { theme } = useTheme();
    // Memoize eventsForDate (tasks and announcement events)
    const eventsForDate = useMemo(() => {
      if (!selectedDate) return [];
      const taskEvents = tasks.filter(
        (task) =>
          new Date(task.deadline).toDateString() ===
          selectedDate.toDateString()
      );
      const announcementEventsForDate = announcementEvents.filter(
        (ann) =>
          ann.eventDate &&
          new Date(ann.eventDate).toDateString() === selectedDate.toDateString()
      );
      return [...taskEvents, ...announcementEventsForDate];
    }, [tasks, selectedDate, announcementEvents]);

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

    // Memoize drag handler for both tasks and announcement events
    const handleDragStart = useCallback(
      (e: React.DragEvent, itemId: string, isTask: boolean) => {
        if (enableDragAndDrop) {
          // Prefix with type so drop handler can distinguish
          e.dataTransfer.setData("text/plain", (isTask ? 'task:' : 'event:') + itemId);
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
      return eventsForDate.map((item) => {
        // Use the same styling logic for both tasks and announcement events
        let isTask = 'deadline' in item;
        let isCompleted = isTask ? (item as Task).completed : true;
        let isOverdueEvent = false;
        let descriptionPreview = '';
        if (isTask) {
          isOverdueEvent = isOverdue(item as Task);
          descriptionPreview = (item as Task).description
            ? ((item as Task).description!.length > 50
                ? (item as Task).description!.substring(0, 50) + '...'
                : (item as Task).description!)
            : '';
        } else {
          // Announcement event: use description if present, otherwise empty
          if ((item as any).description) {
            descriptionPreview = (item as any).description.length > 50
              ? (item as any).description.substring(0, 50) + '...'
              : (item as any).description;
          } else {
            descriptionPreview = '';
          }
        }
        // Theme-aware colors (restored to old style)
        let borderColor = isCompleted
          ? (isTask
              ? (theme === 'dark' ? 'border-green-400' : 'border-green-500')
              : (theme === 'dark' ? 'border-orange-400' : 'border-orange-500'))
          : isOverdueEvent
          ? (theme === 'dark' ? 'border-red-400' : 'border-red-500')
          : (theme === 'dark' ? 'border-blue-400' : 'border-blue-500');

        let bgColor = isCompleted
          ? (isTask
              ? (theme === 'dark'
                  ? 'bg-gray-700 opacity-70 hover:bg-gray-700'
                  : 'bg-green-100 hover:bg-green-200')
              : (theme === 'dark'
                  ? 'bg-orange-500 bg-opacity-80 hover:bg-orange-500'
                  : 'bg-orange-100 hover:bg-orange-200'))
          : isOverdueEvent
          ? (isTask
              ? (theme === 'dark'
                  ? 'bg-gray-700 opacity-70 hover:bg-gray-700'
                  : 'bg-red-100 hover:bg-red-200')
              : (theme === 'dark'
                  ? 'bg-red-500 bg-opacity-90 hover:bg-red-600'
                  : 'bg-red-500 hover:bg-red-600'))
          : (theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-white hover:bg-gray-100');

        let textColor = isOverdueEvent
          ? (isTask
              ? (theme === 'dark' ? 'text-red-300' : 'text-red-700')
              : (theme === 'dark' ? 'text-white' : 'text-white'))
          : isTask
            ? (theme === 'dark' ? '' : 'text-gray-800')
            : (theme === 'dark' ? 'text-white' : 'text-orange-900');
        return (
          <li
            key={item._id}
            className={`p-2 sm:p-3 rounded-lg ${bgColor} ${borderColor} transition-colors cursor-move flex flex-col gap-1`}
            draggable={enableDragAndDrop}
            onDragStart={(e) => handleDragStart(e, item._id, isTask)}
            title={item.title}
          >
            <h4 className={`font-semibold text-base sm:text-lg ${textColor} flex items-center gap-2`}>
              {isOverdueEvent && (
                <span className="text-red-400 text-xs sm:text-sm mr-1">●</span>
              )}
              {item.title}
              {isTask && (item as Task).completed && (
                <span className="text-green-400 text-xs sm:text-sm">(Completed)</span>
              )}
              {isOverdueEvent && (
                <span className="text-red-400 text-xs sm:text-sm ml-1">(Overdue)</span>
              )}
              {!isTask && (
                <span className="text-xs bg-orange-700 text-orange-200 px-2 py-0.5 rounded ml-2">Event</span>
              )}
            </h4>
            {descriptionPreview && (
              <p className={`text-xs sm:text-sm ${
                isOverdueEvent
                  ? (theme === 'dark' ? 'text-red-200' : 'text-red-700')
                  : isTask
                    ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-800')
                    : (theme === 'dark' ? 'text-orange-100' : 'text-orange-900')
              }`}>{descriptionPreview}</p>
            )}
          </li>
        );
      });
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
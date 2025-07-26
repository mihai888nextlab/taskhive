import React, { useMemo, useCallback } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import TaskCard from "../tasks/TaskCard";
import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";
// ...existing code...
interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
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
        const isTask = 'deadline' in item;
        if (isTask) {
          // Render task with TaskCard-like style, but as a list item, without deadline part, with priority badge like TaskCard
          const task = item as Task;
          const isCompleted = task.completed;
          const isOverdueEvent = isOverdue(task);
          // Priority badge logic (match TaskCard)
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const isToday = !isOverdueEvent && deadlineDate.getTime() === now.getTime();
          let priorityBadge = null;
          if (isOverdueEvent) {
            priorityBadge = (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full ml-1">
                <FaExclamationTriangle className="w-3 h-3" />
                Overdue
              </span>
            );
          } else if (task.priority === 'critical') {
            priorityBadge = (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full ml-1">
                🔥 Critical
              </span>
            );
          } else if (task.priority === 'high') {
            priorityBadge = (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full ml-1">
                ⚡ High Priority
              </span>
            );
          } else if (isToday && (task.priority === 'medium' || task.priority === 'low')) {
            priorityBadge = (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full ml-1">
                <FiCalendar className="w-3 h-3" />
                Due Today
              </span>
            );
          }
          return (
            <li
              key={task._id}
              draggable={enableDragAndDrop}
              onDragStart={e => handleDragStart(e, task._id, true)}
              className={`relative p-4 rounded-lg border-l-4 transition-all duration-200 group cursor-pointer flex flex-col gap-1
                ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'}
                ${isCompleted ? 'opacity-60' : ''}
                ${isOverdueEvent ? 'border-l-red-500' : 'border-l-blue-500'}
              `}
              title={task.title}
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className={`font-semibold text-base leading-tight truncate flex-1 ${
                  isCompleted 
                    ? 'line-through text-gray-500' 
                    : theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {task.title}
                </h3>
                {priorityBadge}
              </div>
              {task.description && (
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{
                  task.description.length > 80 
                    ? `${task.description.substring(0, 80)}...`
                    : task.description
                }</p>
              )}
              <div className="flex items-center gap-3 text-xs mt-1">
                {isCompleted && (
                  <span className="text-green-500 font-medium">Completed</span>
                )}
              </div>
            </li>
          );
        } else {
          // Keep event rendering as before
          let descriptionPreview = '';
          if ((item as any).description) {
            descriptionPreview = (item as any).description.length > 50
              ? (item as any).description.substring(0, 50) + '...'
              : (item as any).description;
          }
          return (
            <li
              key={item._id}
              className={`p-2 sm:p-3 rounded-lg bg-orange-100 hover:bg-orange-200 border-orange-500 transition-colors cursor-move flex flex-col gap-1`}
              draggable={enableDragAndDrop}
              onDragStart={(e) => handleDragStart(e, item._id, false)}
              title={item.title}
            >
              <h4 className={`font-semibold text-base sm:text-lg text-orange-900 flex items-center gap-2`}>
                {item.title}
                <span className="text-xs bg-orange-700 text-orange-200 px-2 py-0.5 rounded ml-2">Event</span>
              </h4>
              {descriptionPreview && (
                <p className="text-xs sm:text-sm text-orange-900">{descriptionPreview}</p>
              )}
            </li>
          );
        }
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
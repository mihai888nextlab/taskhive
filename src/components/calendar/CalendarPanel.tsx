import React, { useState, useMemo, useCallback } from "react";
import Calendar from "react-calendar";
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "react-calendar/dist/Calendar.css";

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

interface CalendarPanelProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  deadlines: string[];
  theme: string;
  tasks: Task[];
  onTaskDrop?: (taskId: string, date: Date) => void;
  announcementEvents?: AnnouncementEvent[];
}

type ViewMode = 'month' | 'week';

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getWeekDays(startDate: Date) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

const CalendarPanel: React.FC<CalendarPanelProps> = React.memo(({
  selectedDate,
  onDateChange,
  deadlines,
  theme,
  tasks,
  onTaskDrop,
  announcementEvents = [],
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentWeekDate, setCurrentWeekDate] = useState(selectedDate || new Date());

  // Memoize weekStart and weekDays
  const weekStart = useMemo(() => getWeekStart(currentWeekDate), [currentWeekDate]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  // Memoize navigation and handlers
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentWeekDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  }, []);

  const handleMonthDateClick = useCallback((date: Date) => {
    onDateChange(date);
    setCurrentWeekDate(date);
    setViewMode('week');
  }, [onDateChange]);

  const handleWeekDateClick = useCallback((date: Date) => {
    onDateChange(date);
  }, [onDateChange]);

  const handleBackToMonth = useCallback(() => {
    setViewMode('month');
  }, []);

  const formatWeekRange = useCallback((startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const startMonth = startDate.toLocaleDateString(undefined, { month: 'short' });
    const endMonth = endDate.toLocaleDateString(undefined, { month: 'short' });
    const year = startDate.getFullYear();
    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${year}`;
    } else {
      return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
    }
  }, []);

  const getCircleColor = useCallback((date: Date) => {
    const dateString = date.toDateString();
    const tasksForDate = tasks.filter(task => new Date(task.deadline).toDateString() === dateString);
    const eventsForDate = announcementEvents.filter(event => event.eventDate && new Date(event.eventDate).toDateString() === dateString);
    if (tasksForDate.length === 0 && eventsForDate.length === 0) return null;
    // If there are any incomplete tasks, and the date is in the past, show red
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const hasIncompleteTask = tasksForDate.some(task => !task.completed);
    if (hasIncompleteTask && targetDate < today) return '#EF4444';
    // If all tasks are completed, show green
    if (tasksForDate.length > 0 && tasksForDate.every(task => task.completed)) return '#22C55E';
    // If only events, show orange
    if (tasksForDate.length === 0 && eventsForDate.length > 0) return '#FFA500';
    // Otherwise, show blue for upcoming/incomplete
    return '#4A90E2';
  }, [tasks, announcementEvents]);

  // Memoize drag event handlers for week view
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('bg-blue-100', 'border-blue-400');
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
  }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, date: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
    const itemId = e.dataTransfer.getData('text/plain');
    if (onTaskDrop && itemId) {
      onTaskDrop(itemId, date);
    }
  }, [onTaskDrop]);

  // Memoize drag event handlers for month view
  const handleMonthTileDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  const handleMonthTileDrop = useCallback((e: React.DragEvent<HTMLDivElement>, date: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (onTaskDrop && taskId) {
      onTaskDrop(taskId, date);
    }
  }, [onTaskDrop]);

  // Memoize week view rendering (with events)
  const weekView = useMemo(() => (
    <div className="w-full flex flex-col justify-center items-center overflow-x-auto">
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 lg:p-8 flex flex-col max-w-none" style={{ minHeight: '520px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={handleBackToMonth}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <FaArrowLeft className="text-sm" />
            Back to Month
          </button>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
            {formatWeekRange(weekStart)}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft className="text-blue-600" />
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaChevronRight className="text-blue-600" />
            </button>
          </div>
        </div>
        {/* Week Days */}
        <div className="flex-1 grid grid-cols-7 gap-3 min-h-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => {
            const isToday = weekDays[index].toDateString() === new Date().toDateString();
            const isSelected = selectedDate && weekDays[index].toDateString() === selectedDate.toDateString();
            const hasDeadlines = deadlines.includes(weekDays[index].toDateString());
            const dayTasks = tasks.filter(task => new Date(task.deadline).toDateString() === weekDays[index].toDateString());
            const dayEvents = announcementEvents.filter(event => event.eventDate && new Date(event.eventDate).toDateString() === weekDays[index].toDateString());
            return (
              <div 
                key={dayName} 
                className={`flex flex-col rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50 shadow-lg scale-[1.02]'
                    : isToday
                    ? 'border-2 border-gray-400 bg-gray-50 shadow-md hover:shadow-lg hover:border-blue-300'
                    : hasDeadlines || dayEvents.length > 0
                    ? 'border-gray-200 bg-white shadow-md hover:shadow-lg hover:border-blue-300'
                    : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleWeekDateClick(weekDays[index])}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, weekDays[index])}
              >
                {/* Day Header */}
                <div className="p-3 pb-2 bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {dayName}
                    </span>
                    <div 
                      className={`${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : (hasDeadlines || dayEvents.length > 0) && !isToday
                          ? 'text-white shadow-md'
                          : isToday
                          ? 'bg-blue-500 text-white shadow-lg border-2 border-blue-400'
                          : 'text-gray-700 bg-gray-100'
                      } w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200`}
                      style={{
                        backgroundColor: (hasDeadlines || dayEvents.length > 0) && !isSelected && !isToday
                          ? getCircleColor(weekDays[index]) || undefined
                          : undefined
                      }}
                    >
                      {weekDays[index].getDate()}
                    </div>
                  </div>
                </div>
                {/* Tasks & Events Area */}
                <div className="flex-1 p-3 overflow-y-auto">
                  <div className="space-y-2">
                    {dayTasks.length === 0 && dayEvents.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-gray-400 text-xs">No tasks or events</div>
                      </div>
                    ) : (
                      <>
                        {/* Tasks */}
                        {dayTasks.map(task => {
                          const isOverdue = () => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const taskDate = new Date(task.deadline);
                            taskDate.setHours(0, 0, 0, 0);
                            return taskDate < today && !task.completed;
                          };
                          return (
                            <div
                              key={task._id}
                              className={`p-2 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm ${
                                task.completed
                                  ? 'bg-green-50 border-green-400 text-green-800'
                                  : isOverdue()
                                  ? 'bg-red-50 border-red-400 text-red-800'
                                  : 'bg-blue-50 border-blue-400 text-blue-800'
                              }`}
                              title={task.description || task.title}
                              draggable
                              onDragStart={e => {
                                e.dataTransfer.setData('text/plain', task._id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onClick={e => {
                                e.stopPropagation();
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${
                                  task.completed
                                    ? 'bg-green-500'
                                    : isOverdue()
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-xs leading-tight truncate">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs opacity-75 mt-1 line-clamp-2">
                                      {task.description.length > 30 
                                        ? `${task.description.substring(0, 30)}...` 
                                        : task.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {/* Announcement Events */}
                        {dayEvents.map(event => {
                          // Show description/content preview if present
                          let description = (event as any).description || (event as any).content || '';
                          if (description && description.length > 50) {
                            description = description.substring(0, 50) + '...';
                          }
                          return (
                            <div
                              key={event._id}
                              className="p-2 rounded-lg border-l-4 border-orange-400 bg-orange-50 text-orange-900 transition-all duration-200 hover:shadow-sm flex items-start gap-2"
                              title={event.title}
                            >
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 bg-orange-500" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs leading-tight truncate flex items-center gap-1">
                                  {event.title}
                                </h4>
                                {description && (
                                  <p className="text-xs opacity-75 mt-1 line-clamp-2">{description}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
                {/* Task & Event Summary */}
                {(dayTasks.length > 0 || dayEvents.length > 0) && (
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-3 text-xs">
                      {dayTasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">{dayTasks.length}</span>
                          <span className="text-gray-500">task{dayTasks.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {dayEvents.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600">{dayEvents.length}</span>
                          <span className="text-orange-500">event{dayEvents.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {dayTasks.filter(t => t.completed).length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">
                            {dayTasks.filter(t => t.completed).length}
                          </span>
                        </div>
                      )}
                      {dayTasks.filter(t => !t.completed).length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-600 font-medium">
                            {dayTasks.filter(t => !t.completed).length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ), [weekDays, selectedDate, deadlines, tasks, announcementEvents, handleWeekDateClick, handleDragOver, handleDragLeave, handleDrop, weekStart, formatWeekRange, navigateWeek, handleBackToMonth, getCircleColor]);

  // Memoize month view rendering
  const monthView = useMemo(() => (
    <div className="w-full flex flex-col justify-center items-center overflow-x-auto">
      <Calendar
        onChange={(val) => {
          const date = val instanceof Date ? val : null;
          if (date) {
            handleMonthDateClick(date);
          }
        }}
        value={selectedDate}
        className="border-none !bg-white text-gray-800 p-2 sm:p-4 react-calendar-light-theme w-full max-w-full"
        tileClassName={({ date, view }) => {
          if (view === 'month' && deadlines.includes(date.toDateString())) {
            return 'highlight-deadline';
          }
          return null;
        }}
        tileContent={({ date, view }) => {
          const highlight = view === 'month' && deadlines.includes(date.toDateString());
          const circleColor = getCircleColor(date);
          return (
            <>
              {highlight && circleColor && (
                <div
                  className="highlight-circle-content"
                  style={{
                    backgroundColor: circleColor,
                    color: 'white',
                  }}
                >
                  {date.getDate()}
                </div>
              )}
              <div
                style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer', background: 'transparent' }}
                onDragOver={handleMonthTileDragOver}
                onDrop={e => handleMonthTileDrop(e, date)}
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
    </div>
  ), [selectedDate, deadlines, getCircleColor, handleMonthDateClick, handleMonthTileDragOver, handleMonthTileDrop]);

  return (
    <div className="w-full flex flex-col justify-center items-center overflow-x-auto">
      {viewMode === 'month' ? monthView : weekView}
      {/* Enhanced Global Styles - Fixed Sunday Column Display */}
      <style jsx global>{`
        .react-calendar__tile.highlight-deadline abbr {
          display: none;
        }
        .react-calendar-light-theme {
          background-color: #fff !important;
          border-radius: 0.75rem;
          font-family: 'Inter', sans-serif;
          width: 100%;
          max-width: none;
          padding: 1.8rem !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          min-height: 380px;
        }
        .react-calendar-light-theme .react-calendar__navigation {
          margin-bottom: 1rem;
          height: 45px;
          display: flex;
          align-items: center;
        }
        .react-calendar-light-theme .react-calendar__navigation button {
          background: none !important;
          color: #333;
          min-width: 40px;
          height: 40px;
          font-size: 1.2rem;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .react-calendar-light-theme .react-calendar__navigation button:enabled:hover,
        .react-calendar-light-theme .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6 !important;
          color: #000;
          transform: scale(1.05);
        }
        .react-calendar-light-theme .react-calendar__navigation__label {
          background: none !important;
          color: #2563eb !important;
          font-weight: 700;
          font-size: 1.3rem;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Fix weekdays row */
        .react-calendar-light-theme .react-calendar__month-view__weekdays {
          margin-bottom: 0.7rem;
          height: 35px;
          display: flex;
          width: 100%;
        }
        .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
          color: #6b7280;
          font-size: 0.85rem;
          text-transform: uppercase;
          font-weight: 700;
          padding: 0.5rem 0;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          text-align: center;
        }
        
        /* Fix days grid */
        .react-calendar-light-theme .react-calendar__month-view__days {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
        }
        .react-calendar-light-theme .react-calendar__tile {
          background: none;
          color: #374151;
          border-radius: 0.75rem;
          padding: 0;
          font-size: 0.95rem;
          font-weight: 600;
          width: calc(100% / 7);
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;
          margin: 1px 0;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .react-calendar-light-theme .react-calendar__tile:enabled:hover,
        .react-calendar-light-theme .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6;
          color: #000;
          transform: scale(1.05);
        }
        .react-calendar-light-theme .react-calendar__tile--active {
          background-color: #2563eb !important;
          color: white !important;
          border-radius: 0.75rem;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }
        .react-calendar-light-theme .react-calendar__tile--now {
          background-color: #dbeafe;
          color: #1d4ed8;
          border-radius: 0.75rem;
          font-weight: 700;
        }
        .react-calendar-light-theme .react-calendar__tile--now:enabled:hover,
        .react-calendar-light-theme .react-calendar__tile--now:enabled:focus {
          background-color: #bfdbfe;
        }
        .react-calendar-light-theme .react-calendar__month-view__days__day--neighboringMonth {
          color: #d1d5db;
        }
        .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 600;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        /* Responsive scaling with proper flexbox layout */
        @media (max-width: 768px) {
          .react-calendar-light-theme {
            padding: 1rem !important;
            min-height: 320px;
          }
          .react-calendar-light-theme .react-calendar__navigation {
            height: 40px;
          }
          .react-calendar-light-theme .react-calendar__navigation button {
            min-width: 35px;
            height: 35px;
            font-size: 1rem;
          }
          .react-calendar-light-theme .react-calendar__navigation__label {
            font-size: 1.1rem;
            height: 35px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays {
            height: 30px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
            font-size: 0.7rem;
            padding: 0.3rem 0;
          }
          .react-calendar-light-theme .react-calendar__tile {
            height: 35px;
            font-size: 0.8rem;
          }
          .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
            width: 31px;
            height: 31px;
            font-size: 0.8rem;
          }
        }
        
        @media (min-width: 1024px) {
          .react-calendar-light-theme {
            padding: 2.2rem !important;
            min-height: 420px;
          }
          .react-calendar-light-theme .react-calendar__navigation {
            height: 55px;
          }
          .react-calendar-light-theme .react-calendar__navigation button {
            min-width: 50px;
            height: 50px;
            font-size: 1.4rem;
          }
          .react-calendar-light-theme .react-calendar__navigation__label {
            font-size: 1.4rem;
            height: 50px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays {
            height: 45px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
            font-size: 0.95rem;
            padding: 0.7rem 0;
          }
          .react-calendar-light-theme .react-calendar__tile {
            height: 50px;
            font-size: 1.1rem;
          }
          .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
            width: 46px;
            height: 46px;
            font-size: 1.1rem;
          }
        }
        
        @media (min-width: 1280px) {
          .react-calendar-light-theme {
            padding: 2.8rem !important;
            min-height: 470px;
          }
          .react-calendar-light-theme .react-calendar__navigation {
            height: 65px;
          }
          .react-calendar-light-theme .react-calendar__navigation button {
            min-width: 60px;
            height: 60px;
            font-size: 1.6rem;
          }
          .react-calendar-light-theme .react-calendar__navigation__label {
            font-size: 1.6rem;
            height: 60px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays {
            height: 50px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
            font-size: 1rem;
            padding: 0.9rem 0;
          }
          .react-calendar-light-theme .react-calendar__tile {
            height: 60px;
            font-size: 1.3rem;
          }
          .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
            width: 56px;
            height: 56px;
            font-size: 1.3rem;
          }
        }
        
        @media (min-width: 1536px) {
          .react-calendar-light-theme {
            padding: 3.2rem !important;
            min-height: 520px;
          }
          .react-calendar-light-theme .react-calendar__navigation {
            height: 75px;
          }
          .react-calendar-light-theme .react-calendar__navigation button {
            min-width: 70px;
            height: 70px;
            font-size: 1.8rem;
          }
          .react-calendar-light-theme .react-calendar__navigation__label {
            font-size: 1.8rem;
            height: 70px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays {
            height: 60px;
          }
          .react-calendar-light-theme .react-calendar__month-view__weekdays__weekday {
            font-size: 1.1rem;
            padding: 1.1rem 0;
          }
          .react-calendar-light-theme .react-calendar__tile {
            height: 70px;
            font-size: 1.5rem;
          }
          .react-calendar-light-theme .react-calendar__tile .highlight-circle-content {
            width: 66px;
            height: 66px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
});

export default React.memo(CalendarPanel);
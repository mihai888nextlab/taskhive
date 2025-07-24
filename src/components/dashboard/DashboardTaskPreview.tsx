// components/DashboardTaskPreview.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaSpinner,
  FaRegCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaTasks,
} from "react-icons/fa";
import Link from "next/link";
// import { useRouter } from 'next/router';
import { useTheme } from "@/components/ThemeContext";
import { useTranslations } from "next-intl";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  priority: "critical" | "high" | "medium" | "low";
  userId: any;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  isSubtask?: boolean;
  parentTask?: Task | string;
  subtasks?: Task[];
  tags?: string[];
  important?: boolean;
}

interface DashboardTaskPreviewProps {
  userId?: string;
  userEmail?: string;
  setTitle?: (title: string) => void;
  setHighlight?: (highlight: boolean) => void;
}

const DashboardTaskPreview: React.FC<DashboardTaskPreviewProps> = ({
  userId,
  userEmail,
  setTitle,
  setHighlight,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("DashboardPage");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Memoize isTaskOverdue
  const isTaskOverdue = useCallback((task: Task): boolean => {
    if (task.completed) return false;
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    deadlineDate.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    return deadlineDate < now;
  }, []);

  // Memoize fetchTasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks preview.");
      }
      const data: Task[] = await response.json();
      // Only tasks assigned to me or created by me
      const relevantTasks = data.filter(
        (task) =>
          !task.completed && (
            String(task.userId) === String(userId) ||
            task.createdBy?.email?.toLowerCase() === userEmail?.toLowerCase()
          )
      );
      // Find today's and overdue tasks
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const todayTasks = relevantTasks.filter(task => {
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        return deadline.getTime() <= now.getTime();
      });
      setTodayTasks(todayTasks.slice(0, 5));
      if (setTitle) {
        setTitle(todayTasks.length > 0 ? 'Today Tasks' : 'Tasks');
      }
      if (setHighlight) {
        setHighlight(todayTasks.length > 0);
      }
      // Sort: overdue first, then priority (critical > high > medium > low), then important, then deadline ascending
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const sortTasks = (a: Task, b: Task) => {
        const aOverdue = isTaskOverdue(a);
        const bOverdue = isTaskOverdue(b);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        if (!!a.important && !b.important) return -1;
        if (!a.important && !!b.important) return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      };
      relevantTasks.sort(sortTasks);
      todayTasks.sort(sortTasks);
      setTasks(todayTasks.length > 0 ? todayTasks.slice(0, 2) : relevantTasks.slice(0, 2));
    } catch (err) {
      console.error("Error fetching tasks preview:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail, isTaskOverdue, setTitle, setHighlight]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Memoize handleToggleComplete
  const handleToggleComplete = useCallback(async (task: Task) => {
    setUpdatingTaskId(task._id);
    // Optimistic UI update
    setTasks((currentTasks) =>
      currentTasks.map((t) =>
        t._id === task._id ? { ...t, completed: !t.completed } : t
      )
    );
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update task completion status."
        );
      }
      fetchTasks();
    } catch (err) {
      console.error("Error toggling task completion:", err);
      // Revert update on error
      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t._id === task._id ? { ...t, completed: task.completed } : t
        )
      );
      setError((err as Error).message);
    } finally {
      setUpdatingTaskId(null);
    }
  }, [fetchTasks]);

  // Memoize rendering of task list
  const renderedTasks = useMemo(() => (
    tasks.map((task) => {
      const isOverdue = isTaskOverdue(task);
      const deadlineDate = new Date(task.deadline);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      const isToday = !isOverdue && deadlineDate.getTime() === now.getTime();
      const priority = task.priority as 'critical' | 'high' | 'medium' | 'low';
      // Styling like TaskCard
      // Left border and colored strip only
      let borderColor =
        isOverdue ? 'border-l-4 border-red-500'
        : priority === 'critical' ? 'border-l-4 border-red-500'
        : priority === 'high' ? 'border-l-4 border-orange-500'
        : priority === 'medium' ? 'border-l-4 border-yellow-500'
        : priority === 'low' ? 'border-l-4 border-green-500'
        : theme === 'dark' ? 'border-l-4 border-gray-700' : 'border-l-4 border-gray-200';

      let stripColor =
        isOverdue ? (theme === 'dark' ? 'bg-red-900/40' : 'bg-red-100')
        : priority === 'critical' ? (theme === 'dark' ? 'bg-red-900/40' : 'bg-red-100')
        : priority === 'high' ? (theme === 'dark' ? 'bg-orange-900/40' : 'bg-orange-100')
        : priority === 'medium' ? (theme === 'dark' ? 'bg-yellow-900/40' : 'bg-yellow-100')
        : priority === 'low' ? (theme === 'dark' ? 'bg-green-900/40' : 'bg-green-100')
        : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
      let titleClass =
        isOverdue
          ? "text-lg font-extrabold text-red-700 flex items-center gap-2"
          : priority === 'critical'
            ? "text-lg font-extrabold text-red-700 flex items-center gap-2"
            : priority === 'high'
              ? "text-lg font-extrabold text-orange-700 flex items-center gap-2"
              : priority === 'medium'
                ? "text-lg font-extrabold text-yellow-700 flex items-center gap-2"
                : priority === 'low'
                  ? "text-lg font-extrabold text-green-700 flex items-center gap-2"
                  : theme === "dark"
                      ? "text-gray-100"
                      : "text-gray-900";
      let deadlineClass =
        isOverdue
          ? "text-red-600 font-bold"
          : isToday
            ? "text-yellow-700 font-bold"
            : priority === 'critical'
              ? "text-red-700 font-bold"
              : priority === 'high'
                ? "text-orange-700 font-bold"
                : priority === 'medium'
                  ? "text-yellow-700 font-bold"
                  : priority === 'low'
                    ? "text-green-700 font-bold"
                    : theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700";
      let icon = (
        <FaRegCircle className={`transition-transform duration-300 text-2xl${isOverdue ? ' text-red-500' : ''}`} />
      );
      // Exclamation mark for important or overdue tasks
      let exclamation = null;
      if (isOverdue) {
        exclamation = (
          <FaExclamationTriangle className="inline-block mr-1 text-red-500 text-lg align-middle" title="Overdue" />
        );
      } else if (!!task.important) {
        exclamation = (
          <FaExclamationTriangle className="inline-block mr-1 text-orange-500 text-lg align-middle" title="Important" />
        );
      }

      // Priority tag (badge) - matches TaskCard
      let priorityTag = null;
      if (priority === 'critical') {
        priorityTag = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full ml-2">
            🔥 {t("critical", { default: "Critical" })}
          </span>
        );
      } else if (priority === 'high') {
        priorityTag = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full ml-2">
            ⚡ {t("highPriority", { default: "High Priority" })}
          </span>
        );
      } else if (isToday && (priority === 'medium' || priority === 'low')) {
        priorityTag = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full ml-2">
            <FaArrowRight className="w-3 h-3" />
            {t("dueToday", { default: "Due Today" })}
          </span>
        );
      }

      const hasMultipleSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 1;
      return (
        <li
          key={task._id}
          className={`relative flex items-start justify-between p-5 rounded-xl shadow-sm group ${hasMultipleSubtasks ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} transition-all duration-200 ${borderColor}`}
          title={hasMultipleSubtasks
            ? t("cannotCompleteParentTask", { default: "Cannot complete a parent task with multiple subtasks" })
            : isOverdue
              ? t("taskOverdue", { default: "Task is overdue" })
              : isToday
                ? t("taskDueToday", { default: "Task is due today" })
                : t("clickToMarkComplete", { default: "Click to mark as complete" })}
          style={{ opacity: isOverdue ? 0.9 : 1, background: 'transparent' }}
          onClick={e => {
            e.stopPropagation();
            if (hasMultipleSubtasks) return;
            if (updatingTaskId !== task._id) handleToggleComplete(task);
          }}
        >
          <div className="flex-1 pr-4 relative z-10">
            <span
              className={`leading-tight font-bold flex items-center gap-2 ${titleClass}`}
              style={{ fontSize: (isOverdue || !!task.important) ? '1.15rem' : undefined }}
            >
              {exclamation}
              {task.title}
              {priorityTag}
              {/* Show tags in preview, but do NOT translate */}
              {Array.isArray(task.tags) && task.tags.length > 0 && (
                task.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full ml-1">
                    {tag}
                  </span>
                ))
              )}
              {/* Show badge if task has multiple subtasks */}
              {hasMultipleSubtasks && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full ml-2">
                  {t("multipleSubtasks", { default: "Multiple Subtasks" })}
                </span>
              )}
            </span>
            {task.description && (
              <p className={`mt-2 line-clamp-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {task.description}
              </p>
            )}
            <p className={`mt-3 text-xs flex items-center gap-2 ${deadlineClass}`}> 
              {t("due", { default: "Due:" })} {new Date(task.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {isOverdue && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded font-extrabold tracking-wide shadow-sm border border-red-600">
                  {t("overdue", { default: "OVERDUE" })}
                </span>
              )}
              {isToday && !isOverdue && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-extrabold tracking-wide shadow-sm border border-yellow-600">
                  {t("today", { default: "TODAY" })}
                </span>
              )}
            </p>
          </div>
          <div className="self-center pl-3 relative z-10">
            {updatingTaskId === task._id ? (
              <FaSpinner className="animate-spin text-2xl text-primary" />
            ) : (
              icon
            )}
          </div>
        </li>
      );
    })
  ), [tasks, isTaskOverdue, theme, updatingTaskId, t]);

  // Only render the list and controls, no container or heading
  // Clicking a task marks it complete, clicking outside (card) navigates
  return (
    <>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-32 bg-primary-light/10 rounded-lg animate-pulse">
          <FaSpinner className="animate-spin text-primary text-4xl mb-3" />
          <p className="text-sm font-medium">{t("loadingTasks", { default: "Loading your tasks..." })}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-400 p-4 rounded-md shadow-sm text-center font-medium">
          <p className="mb-1">{t("failedToLoadTasks", { default: "Failed to load tasks:" })}</p>
          <p className="text-sm italic">{error}</p>
          <button onClick={fetchTasks} className="mt-2 hover:underline text-sm">
            {t("tryAgain", { default: "Try again" })}
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <FaTasks className="text-2xl text-gray-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t("noTasksFound", { default: "No Tasks Found" })}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t("createFirstTask", { default: "Create your first task to get started" })}
          </p>
        </div>
      ) : (
        <ul className="space-y-5">
          {renderedTasks}
        </ul>
      )}
    </>
  );
};

export default React.memo(DashboardTaskPreview);
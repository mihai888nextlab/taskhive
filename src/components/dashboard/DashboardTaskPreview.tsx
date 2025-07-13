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
  userId: string;
  createdAt: string;
  updatedAt: string;
  important?: boolean; // Added important property
  createdBy?: {
    email?: string;
    // Add other fields if needed
  };
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
      // Sort: overdue tasks first, then important, then normal, all by deadline ascending
      const sortTasks = (a: Task, b: Task) => {
        const aOverdue = isTaskOverdue(a);
        const bOverdue = isTaskOverdue(b);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        if (!!a.important && !b.important) return -1;
        if (!a.important && !!b.important) return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      };
      relevantTasks.sort(sortTasks);
      todayTasks.sort(sortTasks);
      // Only show the first incomplete task (if not today/overdue)
      setTasks(todayTasks.length > 0 ? todayTasks.slice(0, 5) : relevantTasks.slice(0, 1));
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
      // Only show exclamation for tasks marked as important or overdue
      let showExclamation = !!task.important || isOverdue;

      // Highlight important tasks (overdue/today) with a bolder border and subtle background
      let cardBgClass =
        isOverdue
          ? (theme === "dark"
              ? "bg-red-900/10 border-red-500"
              : "bg-red-50 border-red-500")
          : isToday
            ? (theme === "dark"
                ? "bg-yellow-900/10 border-yellow-500"
                : "bg-yellow-50 border-yellow-500")
            : (theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200");
      let titleClass =
        isOverdue
          ? "text-lg font-extrabold text-red-700 flex items-center gap-2"
          : showExclamation
            ? "text-lg font-extrabold text-gray-900 flex items-center gap-2"
            : theme === "dark"
              ? "text-gray-100"
              : "text-gray-900";
      let deadlineClass =
        isOverdue
          ? "text-red-600 font-bold"
          : isToday
            ? "text-yellow-700 font-bold"
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
      } else if (showExclamation) {
        exclamation = (
          <FaExclamationTriangle className="inline-block mr-1 text-orange-500 text-lg align-middle" title="Important" />
        );
      }

      return (
        <li
          key={task._id}
          className={`relative flex items-start justify-between p-5 rounded-xl border ${cardBgClass} shadow-sm group cursor-pointer transition-all duration-200`}
          title={isOverdue ? t("taskOverdue", { default: "Task is overdue" }) : isToday ? t("taskDueToday", { default: "Task is due today" }) : t("clickToMarkComplete", { default: "Click to mark as complete" })}
          style={{ opacity: isOverdue ? 0.9 : 1 }}
          onClick={e => {
            e.stopPropagation();
            if (updatingTaskId !== task._id) handleToggleComplete(task);
          }}
        >
          <div className="flex-1 pr-4">
            <span
              className={`leading-tight font-bold flex items-center gap-2 ${titleClass}`}
              style={{ fontSize: (isOverdue || showExclamation) ? '1.15rem' : undefined }}
            >
              {exclamation}
              {task.title}
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
          <div className="self-center pl-3">
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
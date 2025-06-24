// components/DashboardTaskPreview.tsx
import React, { useState, useEffect } from "react";
import {
  FaSpinner,
  FaRegCircle,
  FaExclamationTriangle,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
// import { useRouter } from 'next/router';
import { useTheme } from "@/components/ThemeContext";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const DashboardTaskPreview: React.FC = () => {
  const { theme } = useTheme();
  // const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const isTaskOverdue = React.useCallback((task: Task): boolean => {
    if (task.completed) return false;
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    deadlineDate.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    return deadlineDate < now;
  }, []);

  const fetchTasks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks preview.");
      }
      const data: Task[] = await response.json();
      // Filter out completed tasks and sort by deadline (overdue tasks come first)
      const relevantTasks = data.filter((task) => !task.completed);
      relevantTasks.sort((a, b) => {
        const aOverdue = isTaskOverdue(a);
        const bOverdue = isTaskOverdue(b);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
      // Only show the first incomplete task
      setTasks(relevantTasks.slice(0, 1));
    } catch (err) {
      console.error("Error fetching tasks preview:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [isTaskOverdue]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (task: Task) => {
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
  };

  // nu e folosit
  // const handleLogout = async () => {
  //   try {
  //     const res = await fetch("/api/auth/logout", { method: "POST" });
  //     if (!res.ok) {
  //       throw new Error("Logout failed");
  //     }
  //     router.push("/");
  //   } catch (error) {
  //     console.error("Error during logout:", error);
  //   }
  // };

  // Container classes based on theme
  const containerClass =
    theme === "dark"
      ? "mt-6 p-5 bg-gray-800 rounded-xl shadow-lg border border-gray-700 transform transition-transform duration-300 hover:scale-[1.01]"
      : "mt-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.01]";

  const headingClass =
    theme === "dark"
      ? "text-2xl font-extrabold text-gray-100 mb-5 pb-3 border-b-2 border-gray-600 leading-tight"
      : "text-2xl font-extrabold text-gray-900 mb-5 pb-3 border-b-2 border-primary leading-tight";

  const textClass = theme === "dark" ? "text-gray-300" : "text-gray-700";

  // Button classes adjusted for dark theme
  const buttonClass =
    theme === "dark"
      ? "inline-flex items-center justify-center text-gray-100 hover:bg-gray-600 font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-gray-700 shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
      : "inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group";

  return (
    <div className={containerClass}>
      <h3 className={headingClass}>Your Tasks</h3>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-32 bg-primary-light/10 rounded-lg animate-pulse">
          <FaSpinner className="animate-spin text-primary text-4xl mb-3" />
          <p className="text-sm font-medium">Loading your tasks...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-400 p-4 rounded-md shadow-sm text-center font-medium">
          <p className="mb-1">Failed to load tasks:</p>
          <p className="text-sm italic">{error}</p>
          <button onClick={fetchTasks} className="mt-2 hover:underline text-sm">
            Try again
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-5 bg-green-50/20 rounded-md border border-green-200 shadow-inner">
          <p className="font-bold text-lg mb-2">No active tasks! 🎉</p>
          <p className="text-sm leading-relaxed">
            All your tasks are either completed or you haven&apos;t added any
            yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-5">
          {tasks.map((task) => {
            const isOverdue = isTaskOverdue(task);
            let cardBgClass =
              theme === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-gradient-to-r from-blue-50 to-white border-primary-light/50";
            let titleClass =
              theme === "dark" ? "text-gray-100" : "text-gray-900";
            let deadlineClass =
              theme === "dark" ? "text-gray-300" : "text-primary-dark";
            let icon = (
              <FaRegCircle className="transition-transform duration-300 text-4xl group-hover:scale-110" />
            );
            let tooltipText = "Mark as Complete";

            if (isOverdue) {
              cardBgClass =
                theme === "dark"
                  ? "bg-red-900 border-red-700 shadow-lg"
                  : "bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg";
              titleClass =
                theme === "dark"
                  ? "text-gray-100 font-bold"
                  : "text-gray-900 font-bold";
              deadlineClass =
                theme === "dark"
                  ? "text-gray-400 font-semibold"
                  : "text-gray-600 font-semibold";
              icon = (
                <FaExclamationTriangle className="transition-transform duration-300 text-4xl group-hover:scale-110" />
              );
              tooltipText = "Task is Overdue";
            }

            return (
              <li
                key={task._id}
                className={`relative flex items-start justify-between p-5 rounded-xl shadow-md border ${cardBgClass} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div className="flex-1 pr-4">
                  <span
                    className={`block font-bold text-xl leading-tight ${titleClass}`}
                  >
                    {task.title}
                  </span>
                  {task.description && (
                    <p className={`mt-2 line-clamp-2 ${textClass}`}>
                      {task.description}
                    </p>
                  )}
                  <p className={`mt-3 text-sm font-semibold ${deadlineClass}`}>
                    Due:{" "}
                    {new Date(task.deadline).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {isOverdue && (
                      <span className="ml-2 px-2.5 py-1 bg-red-400 text-white text-xs rounded-full font-bold">
                        OVERDUE
                      </span>
                    )}
                  </p>
                </div>
                <div className="self-center pl-3">
                  {updatingTaskId === task._id ? (
                    <FaSpinner className="animate-spin text-3xl text-primary" />
                  ) : (
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-1 ${
                        isOverdue
                          ? "cursor-not-allowed opacity-70"
                          : "focus:ring-primary-light"
                      }`}
                      title={tooltipText}
                      aria-label={tooltipText}
                      disabled={isOverdue}
                    >
                      {icon}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="text-center mt-8">
        <Link href="/app/tasks" className={buttonClass}>
          <span className="mr-3">View All Tasks</span>
          <FaArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardTaskPreview;

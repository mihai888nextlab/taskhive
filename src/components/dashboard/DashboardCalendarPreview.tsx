import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";
import { useTranslations } from "next-intl";

interface Task {
  _id: string;
  title: string;
  deadline: string;
  completed: boolean;
  userId?: string;
  createdBy?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface DashboardCalendarPreviewProps {
  userId?: string;
  userEmail?: string;
}

const DashboardCalendarPreview: React.FC<DashboardCalendarPreviewProps> = ({
  userId,
  userEmail,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("DashboardPage");
  const [deadlines, setDeadlines] = useState<Date[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeadlines = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data: Task[] = await response.json();
        // Only deadlines for my tasks
        const relevantTasks = data.filter(
          (task) =>
            (task.userId?.toString() === userId?.toString() ||
              task.createdBy?.email?.toLowerCase() === userEmail?.toLowerCase()) &&
            !task.completed &&
            task.deadline
        );

        // Map: date string -> array of incomplete tasks for that date
        const tasksByDate = relevantTasks.reduce((acc, task) => {
          const dateStr = new Date(task.deadline).toDateString();
          if (!acc[dateStr]) acc[dateStr] = [];
          acc[dateStr].push(task);
          return acc;
        }, {} as Record<string, Task[]>);

        // Only include dates that have at least one incomplete task
        const uniqueDeadlines = Object.keys(tasksByDate)
          .map((dateStr) => new Date(dateStr))
          .sort((a, b) => a.getTime() - b.getTime());

        setDeadlines(uniqueDeadlines);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, [userId, userEmail]);

  // Container and heading classes based on theme
  const containerClass =
    theme === "dark"
      ? "mt-6 p-5 bg-gray-800 rounded-xl shadow-lg border border-gray-700 transform transition-transform duration-300 hover:scale-[1.01]"
      : "mt-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 transform transition-transform duration-300 hover:scale-[1.01]";

  const headingClass =
    theme === "dark"
      ? "text-2xl font-extrabold text-gray-100 mb-5 pb-3 border-b-2 border-gray-600 leading-tight"
      : "text-2xl font-extrabold text-gray-900 mb-5 pb-3 border-b-2 border-primary leading-tight";

  // List item classes for dark and light themes
  const listItemClassDark =
    "relative flex items-center justify-center p-5 rounded-xl shadow-md border border-gray-600 transition-all duration-300 transform hover:shadow-lg hover:scale-102 group";
  const listItemClassLight =
    "relative flex items-center justify-center p-5 rounded-xl shadow-md border border-gray-200 transition-all duration-300 transform hover:shadow-lg hover:scale-102 group";

  const textClassDark = "font-semibold text-gray-100 text-lg";
  const textClassLight = "font-semibold text-gray-800 text-lg";

  // Button classes exactly matching DashboardTaskPreview
  const buttonClass =
    theme === "dark"
      ? "inline-flex items-center justify-center text-gray-100 hover:bg-gray-600 font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-gray-700 shadow-md hover:shadow-xl transform hover:scale-102 group"
      : "inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:scale-102 group";

  // Remove the outer container and heading, render only the content
  return (
    <>
      <div className="flex-grow">
        {loading ? (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            {t("loadingDeadlines", { default: "Loading deadlines..." })}
          </p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-16">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <FaCalendarAlt className="text-2xl text-gray-400" />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {t("noUpcomingDeadlines", { default: "No upcoming deadlines" })}
            </h3>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t("noScheduledTasksOrEvents", { default: "You have no scheduled tasks or events" })}
            </p>
          </div>
        ) : (
          <ul className="space-y-5">
            {deadlines.slice(0, 2).map((date, idx) => (
              <li
                key={idx}
                className={
                  theme === "dark" ? listItemClassDark : listItemClassLight
                }
              >
                <span
                  className={
                    theme === "dark" ? textClassDark : textClassLight
                  }
                >
                  {date.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default DashboardCalendarPreview;
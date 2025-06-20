import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";

interface Task {
  _id: string;
  title: string;
  deadline: string;
  completed: boolean;
}

const DashboardCalendarPreview: React.FC = () => {
  const { theme } = useTheme();
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
        // Extract deadlines from tasks
        const deadlinesArr = data
          .filter((task) => task.deadline)
          .map((task) => new Date(task.deadline));
        // Remove duplicate dates using toDateString as a key
        const uniqueDeadlines = Array.from(
          new Map(deadlinesArr.map((date) => [date.toDateString(), date])).values()
        );
        // Sort dates in ascending order
        uniqueDeadlines.sort((a, b) => a.getTime() - b.getTime());
        setDeadlines(uniqueDeadlines);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

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
    "relative flex items-center justify-center p-5 rounded-xl shadow-md border border-gray-600 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1 group";
  const listItemClassLight =
    "relative flex items-center justify-center p-5 rounded-xl shadow-md border border-gray-200 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1 group";

  const textClassDark = "font-semibold text-gray-100 text-lg";
  const textClassLight = "font-semibold text-gray-800 text-lg";

  // Button classes exactly matching DashboardTaskPreview
  const buttonClass =
    theme === "dark"
      ? "inline-flex items-center justify-center text-gray-100 hover:bg-gray-600 font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-gray-700 shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
      : "inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group";

  return (
    <div className={containerClass}>
      <h3 className={headingClass}>Upcoming Deadlines</h3>
      <div className="flex-grow">
        {loading ? (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Loading deadlines...
          </p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : deadlines.length === 0 ? (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            No upcoming deadlines.
          </p>
        ) : (
          <ul className="space-y-5">
            {deadlines.slice(0, 2).map((date, idx) => (
              <li
                key={idx}
                className={theme === "dark" ? listItemClassDark : listItemClassLight}
              >
                <span className={theme === "dark" ? textClassDark : textClassLight}>
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
      <div className="mt-8 text-center">
        <Link href="/app/calendar" className={buttonClass}>
          <span className="mr-3">View Calendar</span>
          <FaArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardCalendarPreview;
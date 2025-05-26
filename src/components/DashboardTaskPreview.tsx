// components/DashboardTaskPreview.tsx
import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheckCircle, FaRegCircle, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

// Re-use the Task interface for consistency
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Helper function to determine if a task is overdue
  const isTaskOverdue = (task: Task): boolean => {
    if (task.completed) {
      return false;
    }
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    deadlineDate.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);

    return deadlineDate < now;
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks preview.");
      }
      const data: Task[] = await response.json();

      // Filter for incomplete tasks first, then sort them.
      const relevantTasks = data.filter(task => !task.completed);

      relevantTasks.sort((a, b) => {
        const aOverdue = isTaskOverdue(a);
        const bOverdue = isTaskOverdue(b);

        // Overdue tasks come first
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Then by deadline for tasks within the same overdue status
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return dateA - dateB;
      });

      // Display only the top 3 relevant tasks
      setTasks(relevantTasks.slice(0, 3));

    } catch (err) {
      console.error("Error fetching tasks preview:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleComplete = async (task: Task) => {
    setUpdatingTaskId(task._id);

    // Optimistic UI update for the specific task in the preview
    // Note: This optimistic update might cause the task to disappear
    // immediately if it's completed and no longer relevant for the preview.
    // The subsequent fetchTasks() will re-sync and re-sort.
    setTasks(currentTasks =>
      currentTasks.map(t =>
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
        throw new Error(errorData.message || "Failed to update task completion status.");
      }

      // Re-fetch tasks to ensure the list is updated, sorted, and trimmed correctly
      fetchTasks();

    } catch (err) {
      console.error("Error toggling task completion:", err);
      // Revert optimistic update if API call fails (only if it's still in the list)
      setTasks(currentTasks =>
        currentTasks.map(t =>
          t._id === task._id ? { ...t, completed: task.completed } : t
        )
      );
      setError((err as Error).message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="mt-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.01]">
      <h3 className="text-2xl font-extrabold text-gray-900 mb-5 pb-3 border-b-2 border-primary leading-tight">
        Your Tasks
      </h3>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-32 bg-primary-light/10 rounded-lg animate-pulse">
          <FaSpinner className="animate-spin text-primary text-4xl mb-3" />
          <p className="text-gray-700 text-sm font-medium">Loading your tasks...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-md shadow-sm text-center font-medium">
          <p className="mb-1">Failed to load tasks:</p>
          <p className="text-sm italic">{error}</p>
          <button onClick={fetchTasks} className="mt-2 text-primary-dark hover:underline text-sm">
            Try again
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-gray-600 text-center p-5 bg-green-50/20 rounded-md border border-green-200 shadow-inner">
          <p className="font-bold text-lg mb-2">No active tasks! 🎉</p>
          <p className="text-sm leading-relaxed">
            All your tasks are either completed or you haven't added any yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-5"> {/* Increased space between tasks */}
          {tasks.map((task) => {
            const isOverdue = isTaskOverdue(task);
            const isCompleted = task.completed; // In preview, we only show !completed tasks, but this check is good practice.

            let cardBgClass = 'bg-gradient-to-r from-blue-50 to-white border-primary-light/50';
            let titleClass = 'text-gray-900';
            let descriptionClass = 'text-gray-700';
            let deadlineClass = 'text-primary-dark';
            let icon = <FaRegCircle className="text-primary text-4xl transition-transform duration-300 group-hover:scale-110" />; {/* Increased icon size */}
            let tooltipText = "Mark as Complete";

            if (isCompleted) {
              // Although filtered out, keeping this for completeness if filtering logic changes
              cardBgClass = 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 opacity-80';
              titleClass = 'line-through text-gray-600';
              descriptionClass = 'line-through text-gray-500';
              deadlineClass = 'text-gray-400';
              icon = <FaCheckCircle className="text-green-500 text-4xl transition-transform duration-300 group-hover:scale-110" />; {/* Increased icon size */}
              tooltipText = "Mark as Incomplete";
            } else if (isOverdue) {
              cardBgClass = 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg';
              titleClass = 'text-gray-900 font-bold'; // Changed from text-red-800
              descriptionClass = 'text-gray-700'; // Changed from text-red-700
              deadlineClass = 'text-gray-600 font-semibold'; // Changed from text-red-600, slightly darker gray
              icon = <FaExclamationTriangle className="text-red-500 text-4xl transition-transform duration-300 group-hover:scale-110" />; {/* Keep warning icon */}
              tooltipText = "Task is Overdue";
            }

            return (
              <li
                key={task._id}
                className={`relative flex items-start justify-between p-5 rounded-xl shadow-md border {/* Increased padding */}
                  ${cardBgClass}
                  hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div className="flex-1 pr-4">
                  <span className={`block font-bold text-xl leading-tight ${titleClass}`}> {/* Increased title size */}
                    {task.title}
                  </span>
                  {task.description && (
                    <p className={`text-base mt-2 line-clamp-2 ${descriptionClass}`}> {/* Increased description size and margin */}
                      {task.description}
                    </p>
                  )}
                  <p className={`text-sm font-semibold mt-3 ${deadlineClass}`}> {/* Increased deadline margin */}
                    Due: {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {isOverdue && !isCompleted && <span className="ml-2 px-2.5 py-1 bg-red-400 text-white text-xs rounded-full font-bold">OVERDUE</span>} {/* Slightly larger badge */}
                  </p>
                </div>
                <div className="flex-shrink-0 self-center pl-3"> {/* Increased padding */}
                  {updatingTaskId === task._id ? (
                    <FaSpinner className="animate-spin text-primary text-3xl" />
                  ) : (
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-1
                                  ${isOverdue && !isCompleted ? 'cursor-not-allowed opacity-70' : 'focus:ring-primary-light'} `}
                      title={tooltipText}
                      aria-label={tooltipText}
                      disabled={isOverdue && !isCompleted}
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
        <Link
          href="/app/tasks"
          className="inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
        >
          <span className="mr-3">View All Tasks</span>
          <FaArrowRight className="text-xl transform transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardTaskPreview;
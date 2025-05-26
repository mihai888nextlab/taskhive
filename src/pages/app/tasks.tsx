// pages/app/profile.tsx (Your main tasks page)
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { MdAddTask } from "react-icons/md"; // Icon for add task button
import { FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaSpinner, FaExclamationTriangle } from "react-icons/fa"; // Added FaExclamationTriangle

// Re-define Task interface to match backend model
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

// --- Helper function for overdue status (can be moved to a utils file if preferred) ---
const isTaskOverdue = (task: Task): boolean => {
  // A task is overdue only if it's NOT completed and its deadline has passed.
  if (task.completed) {
    return false;
  }
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  // To compare only dates, set deadline to end of its day and 'now' to start of today.
  deadlineDate.setHours(23, 59, 59, 999); // End of the deadline day
  now.setHours(0, 0, 0, 0); // Start of today

  return deadlineDate < now;
};
// --- End of helper function ---


const TasksPage: NextPageWithLayout = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskDeadline, setTaskDeadline] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // For initial data fetch and form submissions
  const [formError, setFormError] = useState<string | null>(null); // Specific error for the form
  const [listError, setListError] = useState<string | null>(null); // Specific error for task list fetch

  // Function to fetch tasks from the API
  const fetchTasks = async () => {
    setLoading(true);
    setListError(null); // Clear previous list errors
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks.");
      }
      let data: Task[] = await response.json();

      // --- REVISED SORTING LOGIC FOR TASKS PAGE (Sort by Deadline, then push completed to end) ---
      data.sort((a, b) => {
        // Prioritize by completion status: incomplete tasks first
        if (a.completed && !b.completed) return 1;  // 'a' is completed, 'b' is not: 'a' goes after 'b'
        if (!a.completed && b.completed) return -1; // 'a' is not completed, 'b' is: 'a' goes before 'b'

        // If both are completed or both are incomplete, sort by deadline
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return dateA - dateB; // Ascending order (earliest deadline first)
      });
      // --- END REVISED SORTING LOGIC ---

      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setListError((err as Error).message); // Set list-specific error
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setEditingTaskId(null);
    setFormError(null); // Clear form error on reset
  };

  // Function to handle adding a new task or updating an existing one
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskTitle.trim() || !taskDeadline.trim()) {
      setFormError("Task title and deadline are required!");
      return;
    }

    setLoading(true); // Indicate loading for form submission
    setFormError(null); // Clear previous form error

    const taskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      deadline: taskDeadline,
    };

    try {
      let response;
      if (editingTaskId) {
        response = await fetch(`/api/tasks/${editingTaskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      } else {
        response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingTaskId ? 'update' : 'add'} task.`);
      }

      // Re-fetch all tasks to get the latest state from the database and re-apply sorting
      await fetchTasks();

      // Clear form fields and reset state
      resetForm();
      setShowForm(false); // Hide form after successful submission
    } catch (err) {
      console.error(`Error ${editingTaskId ? 'updating' : 'adding'} task:`, err);
      setFormError((err as Error).message); // Set form-specific error
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    const deadlineDate = new Date(task.deadline);
    setTaskDeadline(deadlineDate.toISOString().split('T')[0]); // Format for input type="date"
    setEditingTaskId(task._id);
    setShowForm(true); // Always show the form when editing
    setFormError(null); // Clear any existing form errors
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    setLoading(true); // Indicate loading for delete operation
    setListError(null); // Clear list error
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task.");
      }

      // Optimistically remove the task from the UI for immediate feedback
      setTasks(currentTasks => currentTasks.filter(task => task._id !== id));
      // Re-fetch to confirm deletion and keep state consistent
      await fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      setListError((err as Error).message); // Set list-specific error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    // Optimistic UI update
    setTasks(currentTasks =>
      currentTasks.map(t =>
        t._id === task._id ? { ...t, completed: !t.completed } : t
      )
    );

    setLoading(true); // Indicate loading for toggle operation
    setListError(null); // Clear list error
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
      // Re-fetch to re-apply sorting (e.g., move completed tasks to the bottom)
      await fetchTasks();
    } catch (err) {
      console.error("Error toggling task completion:", err);
      setListError((err as Error).message); // Set list-specific error
      // Revert optimistic update if API call fails
      setTasks(currentTasks =>
        currentTasks.map(t =>
          t._id === task._id ? { ...t, completed: task.completed } : t
        )
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    // Outer container with a subtle gradient background for depth
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-8 font-sans overflow-hidden">
      {/* Decorative background circles - using primary colors for consistency */}
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-primary-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <main className="relative z-10 w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 transform transition-all duration-500 ease-in-out hover:shadow-3xl-lg ring-1 ring-gray-100">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tighter leading-tight">
          Your Personal Task Manager
        </h1>
        <p className="text-center text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Organize your day, prioritize your goals, and track your progress with ease.
        </p>

        {/* Add Task Button & Form Toggle - using primary and secondary colors */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              resetForm();
            } else {
              setEditingTaskId(null);
              resetForm();
            }
          }}
          className="mb-8 w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          disabled={loading}
          aria-expanded={showForm}
          aria-controls="task-form"
        >
          <MdAddTask className="text-2xl" />
          <span>{showForm ? "Hide Task Form" : "Add New Task"}</span>
        </button>

        {/* Task Add/Edit Form */}
        <div
          id="task-form"
          className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'max-h-[500px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}
        >
          <form onSubmit={handleAddTask} className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-xl border border-gray-200 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              {editingTaskId ? "Edit Task Details" : "Create New Task"}
            </h2>
            {formError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm" role="alert">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-bold">Validation Error</p>
                    <p className="text-sm">{formError}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="taskTitle" className="block text-gray-700 text-sm font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500">
                  Title:
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base"
                  placeholder="e.g., Prepare presentation for Q3 review"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  disabled={loading}
                  aria-label="Task title"
                />
              </div>
              <div>
                <label htmlFor="taskDeadline" className="block text-gray-700 text-sm font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500">
                  Deadline:
                </label>
                <input
                  type="date"
                  id="taskDeadline"
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  required
                  disabled={loading}
                  aria-label="Task deadline date"
                />
              </div>
            </div>
            <div className="mb-8">
              <label htmlFor="taskDescription" className="block text-gray-700 text-sm font-semibold mb-2">
                Description (Optional):
              </label>
              <textarea
                id="taskDescription"
                rows={4}
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200 placeholder-gray-400 text-base"
                placeholder="Add more details or sub-tasks here..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                disabled={loading}
                aria-label="Task description"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
                <button
                type="submit"
                className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-lg"
                disabled={loading}
                >
                    {loading && <FaSpinner className="animate-spin mr-3 text-xl" />}
                    {editingTaskId ? "Update Task" : "Add Task"}
                </button>
                {editingTaskId && (
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowForm(false);
                    }}
                    className="inline-flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-lg"
                    disabled={loading}
                >
                    Cancel
                </button>
                )}
            </div>
          </form>
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-8 mt-12 pb-4 border-b-4 border-primary-dark text-center">
            My Task List
        </h2>

        {/* Conditional rendering for loading, error, and empty states */}
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 bg-primary-light/10 rounded-lg shadow-inner animate-pulse">
            <FaSpinner className="animate-spin text-primary text-5xl mb-4" />
            <p className="text-xl text-gray-700 font-semibold">Loading your tasks...</p>
          </div>
        ) : listError ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-sm text-center mt-8" role="alert">
            <div className="flex flex-col items-center">
              <svg className="h-10 w-10 text-red-500 mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-bold text-lg mb-2">Failed to Load Tasks</p>
              <p className="text-base">{listError}</p>
              <button onClick={fetchTasks} className="mt-4 inline-flex items-center text-primary-dark hover:text-primary font-semibold underline transition-colors">
                <FaSpinner className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Try again
              </button>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-600 text-xl mt-8 p-6 bg-primary-light/10 rounded-lg border border-primary-light/30 shadow-md">
            <p className="font-semibold mb-3">No tasks added yet. Time to get productive!</p>
            <p className="text-lg">Click the "Add New Task" button above to start organizing your life.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tasks.map((task) => {
              const isOverdue = isTaskOverdue(task);
              const isCompleted = task.completed;

              // --- Dynamic Styling for Card Background, Text Colors, and Icon ---
              let cardBgClass = 'bg-white border-l-8 border-primary'; // Default for upcoming/pending
              let titleClass = 'text-gray-900';
              let descriptionClass = 'text-gray-700';
              let deadlineClass = 'text-gray-500';
              let statusIcon = <FaRegCircle className="text-gray-400 text-3xl mr-2 group-hover:text-primary transition-colors" />;
              let statusTooltip = "Mark as Complete";

              if (isCompleted) {
                cardBgClass = 'opacity-80 bg-green-50 border-l-8 border-green-400';
                titleClass = 'line-through text-gray-600';
                descriptionClass = 'line-through text-gray-500';
                deadlineClass = 'text-gray-400';
                statusIcon = <FaCheckCircle className="text-green-500 text-3xl mr-2 group-hover:text-green-600 transition-colors" />;
                statusTooltip = "Mark as Incomplete";
              } else if (isOverdue) {
                cardBgClass = 'bg-red-50 border-l-8 border-red-400 shadow-lg'; // Keep red background
                titleClass = 'text-gray-900 font-bold'; // Changed from text-red-800
                descriptionClass = 'text-gray-700'; // Changed from text-red-700
                deadlineClass = 'text-gray-600 font-semibold'; // Changed from text-red-600, slightly darker gray
                statusIcon = <FaExclamationTriangle className="text-red-500 text-3xl mr-2" />; // Keep warning icon
                statusTooltip = "Task is Overdue (Cannot complete directly)";
              }
              // --- End Dynamic Styling ---

              return (
                <div
                  key={task._id}
                  className={`group flex flex-col justify-between p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-gray-100 ${cardBgClass}`}
                  aria-label={`Task: ${task.title}, Status: ${task.completed ? 'Completed' : 'Pending'}${isOverdue && !isCompleted ? ', Overdue' : ''}`}
                >
                  {/* Task Content */}
                  <div className="flex-1">
                      <h3 className={`text-2xl font-bold leading-tight mb-3 break-words ${titleClass}`}>
                          {task.title}
                      </h3>
                      {task.description && (
                          <p className={`text-base mb-4 line-clamp-3 ${descriptionClass}`}>
                              {task.description}
                          </p>
                      )}
                      <p className={`text-sm font-semibold ${deadlineClass}`}>
                          Deadline: {new Date(task.deadline).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'long', day: 'numeric'
                          })}
                          {isOverdue && !isCompleted && (
                            <span className="ml-2 px-2.5 py-1 bg-red-400 text-white text-xs rounded-full font-bold">OVERDUE</span>
                          )}
                      </p>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
                      {/* Checkbox/Toggle Button */}
                      <button
                          onClick={() => handleToggleComplete(task)}
                          className={`flex items-center text-lg font-semibold p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group
                                    ${(isOverdue && !isCompleted) ? 'text-red-700 focus:ring-red-500' : 'text-gray-700 focus:ring-primary'}`}
                          title={statusTooltip}
                          aria-label={statusTooltip}
                          disabled={loading || (isOverdue && !isCompleted)} // Disable if loading or overdue and not completed
                      >
                          {statusIcon}
                          <span className="hidden sm:inline">
                            {isOverdue && !isCompleted ? "Overdue" : (task.completed ? "Completed" : "Mark Complete")}
                          </span>
                      </button>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                          <button
                              onClick={() => handleEditTask(task)}
                              className="text-primary hover:text-primary-dark p-3 rounded-full hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Edit Task"
                              disabled={loading || task.completed || isOverdue} // Disable edit if task is completed or overdue
                          >
                              <FaEdit className="text-2xl" />
                          </button>
                          <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-red-500 hover:text-red-700 p-3 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Task"
                              disabled={loading}
                          >
                              <FaTrash className="text-2xl" />
                          </button>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

TasksPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TasksPage;
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { MdAddTask } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import AssignedTasksList from "@/components/tasks/AssignedTasksList";

interface TaskUser {
  _id: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  userId: string | TaskUser | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  important?: boolean;
}

async function fetchCurrentUser() {
  const res = await fetch("/api/user", { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch current user");
  return await res.json();
}

const isTaskOverdue = (task: Task): boolean => {
  if (task.completed) return false;
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  deadlineDate.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);
  return deadlineDate < now;
};

const TasksPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [usersBelowMe, setUsersBelowMe] = useState<any[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [important, setImportant] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("createdAtDesc");

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks.");
      const data: Task[] = await response.json();

      // Only tasks assigned to me
      const myTasks = data.filter((task) => {
        // Assigned to me (by id or by email)
        if (!task.userId) return false;
        // userId is string
        if (typeof task.userId === "string") {
          return task.userId === currentUserId;
        }
        // userId is object
        if (typeof task.userId === "object") {
          // Try _id first (robust for ObjectId)
          if (task.userId._id && String(task.userId._id) === String(currentUserId)) return true;
          // Fallback to email if available
          if (task.userId.email && task.userId.email.trim().toLowerCase() === currentUserEmail) return true;
        }
        return false;
      });

      let sortedData = [...myTasks];
      sortedData.sort((a, b) => {
        const isAOverdue = isTaskOverdue(a);
        const isBOverdue = isTaskOverdue(b);

        if (isAOverdue && !a.completed && (!isBOverdue || b.completed)) return -1;
        if (isBOverdue && !b.completed && (!isAOverdue || a.completed)) return 1;
        if (a.important && !a.completed && !isAOverdue && (!b.important || b.completed || isBOverdue)) return -1;
        if (b.important && !b.completed && !isBOverdue && (!a.important || a.completed || isAOverdue)) return 1;
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
      setTasks(sortedData);
    } catch (err) {
      setListError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned tasks
  const fetchAssignedTasks = async () => {
    try {
      const response = await fetch("/api/tasks/assigned-by-me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch assigned tasks.");
      const data = await response.json();
      setAssignedTasks(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch users below
  useEffect(() => {
    async function fetchUsersBelow() {
      const res = await fetch("/api/roles-below-me");
      const data = await res.json();
      setUsersBelowMe(data.usersBelow || []);
    }
    fetchUsersBelow();
  }, []);

  // Fetch current user
  useEffect(() => {
    fetch("/api/user")
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data?.user?.email) setCurrentUserEmail(data.user.email.trim().toLowerCase());
        if (data?.user?._id) setCurrentUserId(data.user._id);
      })
      .catch(() => {
        setCurrentUserEmail("");
        setCurrentUserId("");
      });
  }, []);

  // Fetch tasks on mount and when sortBy changes
  useEffect(() => {
    if (currentUserId) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, sortBy]);

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  // Form handlers
  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setEditingTaskId(null);
    setFormError(null);
    setAssignedTo("");
    setImportant(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDeadline.trim()) {
      setFormError("Task title and deadline are required!");
      return;
    }
    setLoading(true);
    setFormError(null);
    const taskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      deadline: taskDeadline,
      assignedTo,
      important,
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
      if (!response.ok) throw new Error("Failed to save task.");
      await fetchTasks();            // <-- Refresh your own tasks
      await fetchAssignedTasks();    // <-- Refresh assigned-by-me tasks
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskDeadline(new Date(task.deadline).toISOString().split("T")[0]);
    setEditingTaskId(task._id);
    setShowForm(true);
    setFormError(null);
    setAssignedTo(typeof task.userId === "string" ? task.userId : "");
    setImportant(task.important || false);
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task.");
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== id));
      await fetchTasks();
    } catch (err) {
      setListError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((t) =>
        t._id === task._id ? { ...t, completed: !t.completed } : t
      )
    );
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error("Failed to update task.");
      await fetchTasks();
    } catch (err) {
      setListError((err as Error).message);
      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t._id === task._id ? { ...t, completed: task.completed } : t
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 p-2 sm:p-4 md:p-8 font-sans overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-primary-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <main className={`relative z-10 w-full max-w-6xl mx-auto bg-${theme === 'light' ? 'white' : 'gray-800'} rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 md:p-12`}>
        <h1 className={`text-5xl font-extrabold text-${theme === 'light' ? 'gray-900' : 'white'} mb-6 text-center tracking-tighter leading-tight`}>
          Your Personal Task Manager
        </h1>
        <p className={`text-center text-lg text-${theme === 'light' ? 'gray-600' : 'gray-400'} mb-10 max-w-2xl mx-auto`}>
          Organize your day, prioritize your goals, and track your progress with ease.
        </p>

        {/* Add Task Button */}
        <button
          onClick={() => {
            if (!showForm) resetForm();
            setShowForm((prev) => !prev);
          }}
          className="mb-8 w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg"
          disabled={loading}
          aria-expanded={showForm}
          aria-controls="task-form"
        >
          <MdAddTask className="text-2xl" />
          <span>{showForm ? "Hide Task Form" : "Add New Task"}</span>
        </button>

        {/* Task Form */}
        <TaskForm
          show={showForm}
          loading={loading}
          editingTaskId={editingTaskId}
          taskTitle={taskTitle}
          taskDescription={taskDescription}
          taskDeadline={taskDeadline}
          assignedTo={assignedTo}
          usersBelowMe={usersBelowMe}
          formError={formError}
          theme={theme}
          important={important}
          onTitleChange={setTaskTitle}
          onDescriptionChange={setTaskDescription}
          onDeadlineChange={setTaskDeadline}
          onAssignedToChange={setAssignedTo}
          onImportantChange={setImportant}
          onSubmit={handleAddTask}
          onCancel={() => {
            resetForm();
            setShowForm(false);
          }}
        />

        <h2 className={`text-4xl font-bold text-${theme === 'light' ? 'gray-900' : 'white'} mb-8 mt-12 pb-4 border-b-4 border-primary-dark text-center`}>
          My Task List
        </h2>

        {/* Task List */}
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 bg-primary-light/10 rounded-lg shadow-inner animate-pulse">
            <FaSpinner className="animate-spin text-primary text-5xl mb-4" />
            <p className={`text-xl text-${theme === 'light' ? 'gray-700' : 'gray-300'} font-semibold`}>
              Loading your tasks...
            </p>
          </div>
        ) : listError ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-sm text-center mt-8" role="alert">
            <div className="flex flex-col items-center">
              <FaSpinner className={`mr-2 ${loading ? "animate-spin" : ""}`} />
              <p className="font-bold text-lg mb-2">Failed to Load Tasks</p>
              <p className="text-base">{listError}</p>
              <button
                onClick={fetchTasks}
                className="mt-4 inline-flex items-center text-primary-dark hover:text-primary font-semibold underline transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-600 text-xl mt-8 p-6 bg-primary-light/10 rounded-lg border border-primary-light/30 shadow-md">
            <p className="font-semibold mb-3">
              No tasks added yet. Time to get productive!
            </p>
            <p className="text-lg">
              Click the &quot;Add New Task&quot; button above to start organizing your life.
            </p>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            currentUserEmail={currentUserEmail}
            loading={loading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
            isTaskOverdue={isTaskOverdue}
          />
        )}

        {/* Tasks I Assigned to Others */}
        <h2 className={`text-4xl font-bold text-${theme === 'light' ? 'gray-900' : 'white'} mb-8 mt-16 pb-4 border-b-4 border-secondary text-center`}>
          Tasks I Assigned to Others
        </h2>
        {assignedTasks.length === 0 ? (
          <div className="text-center text-gray-600 text-xl mt-8 p-6 bg-secondary/10 rounded-lg border border-secondary/30 shadow-md">
            <p className="font-semibold mb-3">
              You haven&apos;t assigned any tasks to others yet.
            </p>
            <p className="text-lg">
              Assign tasks to your team and track their progress here.
            </p>
          </div>
        ) : (
          <AssignedTasksList
            assignedTasks={assignedTasks}
            loading={loading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isTaskOverdue={isTaskOverdue}
            currentUserEmail={currentUserEmail}
          />
        )}
      </main>
    </div>
  );
};

TasksPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TasksPage;
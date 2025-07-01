import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { MdAddTask } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import AssignedTasksList from "@/components/tasks/AssignedTasksList";
import TaskCard from "@/components/tasks/TaskCard";

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
  isSubtask?: boolean;
  parentTask?: string;
  subtasks?: Task[]; // Array of populated subtask objects
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

  // --- Controlled state for My Task List ---
  const [mySearch, setMySearch] = useState("");
  const [myFilterStatus, setMyFilterStatus] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [myFilterImportant, setMyFilterImportant] = useState<"all" | "important" | "not-important">("all");
  const [mySortBy, setMySortBy] = useState<"createdAtDesc" | "deadlineAsc">("deadlineAsc");

  // --- Controlled state for Assigned Tasks List ---
  const [assignedSearch, setAssignedSearch] = useState("");
  const [assignedFilterStatus, setAssignedFilterStatus] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [assignedFilterImportant, setAssignedFilterImportant] = useState<"all" | "important" | "not-important">("all");
  const [assignedSortBy, setAssignedSortBy] = useState<"createdAtDesc" | "deadlineAsc">("deadlineAsc");

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
  }, [currentUserId, mySortBy]);

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

  const handleAddTask = async (e: React.FormEvent, subtasks?: any[]) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDeadline.trim()) {
      setFormError("Task title and deadline are required!");
      return;
    }
    setLoading(true);
    setFormError(null);
    
    // Debug log
    console.log("Creating task with data:", {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      deadline: taskDeadline,
      assignedTo: assignedTo || undefined, // <- Fix: Don't send empty string
      important,
      subtasks: subtasks || [],
    });
    
    const taskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      deadline: taskDeadline,
      ...(assignedTo && { assignedTo }), // <- Only include if not empty
      important,
      subtasks: subtasks || [],
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
      
      // Debug the response
      const responseText = await response.text();
      console.log("API Response:", responseText);
      
      if (!response.ok) {
        let errorMessage = "Failed to save task.";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }
      
      await fetchTasks();
      await fetchAssignedTasks();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error creating task:", err);
      setFormError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (e: React.FormEvent, subtasks?: any[]) => {
    e.preventDefault();
    if (loading || !editingTaskId) return;

    setLoading(true);
    try {
      // Only include fields that are being edited
      const updateData: any = {
        title: taskTitle,
        description: taskDescription,
        deadline: taskDeadline,
        important: important,
      };

      // Only include assignedTo if it's different
      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      // NOTE: We don't include subtasks in edit operations to preserve existing ones
      // Subtasks should be managed separately through the subtask edit functionality

      console.log("Updating task with data:", updateData);

      const response = await fetch(`/api/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task.");
      }

      await fetchTasks();
      await fetchAssignedTasks();
      resetForm();
    } catch (err) {
      console.error("Error updating task:", err);
      setFormError((err as Error).message);
    } finally {
      setLoading(false);
    }
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
    if (loading) return;
    
    // Don't allow manual completion of tasks that have subtasks
    if (task.subtasks && task.subtasks.length > 0 && !task.isSubtask) {
      alert("This task has subtasks. Complete all subtasks to automatically complete this task.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task.");
      }

      // Refresh both task lists to ensure parent tasks are updated correctly
      await fetchTasks();
      await fetchAssignedTasks();
    } catch (err) {
      console.error("Error toggling task completion:", err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Find the handleEditClick function and update it:
  const handleEditClick = (task: Task) => {
    setEditingTaskId(task._id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    
    // Format the deadline properly for the date input
    const deadlineDate = new Date(task.deadline);
    const formattedDeadline = deadlineDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    setTaskDeadline(formattedDeadline);
    
    setAssignedTo(typeof task.userId === "object" && task.userId ? task.userId._id : (task.userId as string) || "");
    setImportant(task.important || false);
    setFormError(null);
    setShowForm(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 px-2 font-sans overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-10 left-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-primary-light rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-10 right-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-36 h-36 sm:w-56 sm:h-56 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <main className="relative z-10 w-full mx-auto px-0 sm:px-2 md:px-4 py-8" style={{maxWidth: '100vw'}}>
        {/* Heading and description
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            Your Personal Task Manager
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-2">
            Organize your day, prioritize your goals, and track your progress with ease.
          </p>
        </div> */}

        {/* Two-column layout for tasks */}
        <div className="flex flex-col md:flex-row gap-10 items-start w-full">
          {/* Left: My Tasks */}
          <section className="bg-white/90 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 flex flex-col w-full md:flex-1 md:max-w-none min-h-[700px] max-h-[850px]">
            <div className="flex items-center justify-between mb-6 mt-2 pb-2 border-b-2 border-primary-dark">
              <h2 className="text-2xl font-bold text-gray-900 text-left">
                My Task List
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="py-2 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 text-base"
                disabled={loading}
                aria-expanded={showForm}
                aria-controls="task-form"
              >
                <MdAddTask className="text-xl" />
                <span>Add New Task</span>
              </button>
            </div>
            {/* Controls always visible on top, sticky */}
            <div className="sticky top-0 z-20 bg-white/90 pb-4" style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.01)' }}>
              <TaskList
                tasks={tasks}
                currentUserEmail={currentUserEmail}
                loading={loading}
                onEdit={(task: Task) => {
                  setEditingTaskId(task._id);
                  setTaskTitle(task.title);
                  setTaskDescription(task.description || "");
                  
                  // Format the deadline properly for the date input
                  const deadlineDate = new Date(task.deadline);
                  const formattedDeadline = deadlineDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
                  setTaskDeadline(formattedDeadline);
                  
                  setAssignedTo(typeof task.userId === "object" && task.userId ? task.userId._id : (task.userId as string) || "");
                  setImportant(task.important || false);
                  setFormError(null);
                  setShowForm(true);
                }}
                onDelete={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                isTaskOverdue={isTaskOverdue}
                theme={theme}
                controlsOnly
                search={mySearch}
                onSearchChange={setMySearch}
                filterStatus={myFilterStatus}
                onFilterStatusChange={setMyFilterStatus}
                filterImportant={myFilterImportant}
                onFilterImportantChange={setMyFilterImportant}
                sortBy={mySortBy}
                onSortByChange={setMySortBy}
              />
            </div>
            {/* Scrollable task cards only */}
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ minHeight: '400px', maxHeight: '700px' }}>
              <TaskList
                tasks={tasks}
                currentUserEmail={currentUserEmail}
                loading={loading}
                onEdit={(task: Task) => {
                  setEditingTaskId(task._id);
                  setTaskTitle(task.title);
                  setTaskDescription(task.description || "");
                  
                  // Format the deadline properly for the date input
                  const deadlineDate = new Date(task.deadline);
                  const formattedDeadline = deadlineDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
                  setTaskDeadline(formattedDeadline);
                  
                  setAssignedTo(typeof task.userId === "object" && task.userId ? task.userId._id : (task.userId as string) || "");
                  setImportant(task.important || false);
                  setFormError(null);
                  setShowForm(true);
                }}
                onDelete={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                isTaskOverdue={isTaskOverdue}
                theme={theme}
                cardsOnly
                search={mySearch}
                filterStatus={myFilterStatus}
                filterImportant={myFilterImportant}
                sortBy={mySortBy}
              />
            </div>
          </section>

          {/* Right: Assigned Tasks */}
          <section className="bg-white/90 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 flex flex-col w-full md:flex-1 md:max-w-none min-h-[700px] max-h-[850px]">
            <div className="flex items-center justify-between mb-6 mt-4 pb-2 border-b-2 border-primary-dark">
              <h2 className="text-2xl font-bold text-gray-900 text-left">
                Tasks Assigned By Me
              </h2>
            </div>
            {/* Controls always visible on top, sticky */}
            <div className="sticky top-0 z-20 bg-white/90 pb-4" style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.01)' }}>
              <AssignedTasksList
                tasks={assignedTasks}
                loading={loading}
                onEdit={(task: Task) => {
                  setEditingTaskId(task._id);
                  setTaskTitle(task.title);
                  setTaskDescription(task.description || "");
                  setTaskDeadline(task.deadline);
                  setAssignedTo(
                    typeof task.userId === "string"
                      ? task.userId
                      : (task.userId && task.userId._id) || ""
                  );
                  setImportant(!!task.important);
                  setShowForm(true);
                }}
                onDelete={handleDeleteTask}
                isTaskOverdue={isTaskOverdue}
                currentUserEmail={currentUserEmail}
                controlsOnly
                search={assignedSearch}
                onSearchChange={setAssignedSearch}
                filterStatus={assignedFilterStatus}
                onFilterStatusChange={setAssignedFilterStatus}
                filterImportant={assignedFilterImportant}
                onFilterImportantChange={setAssignedFilterImportant}
                sortBy={assignedSortBy}
                onSortByChange={setAssignedSortBy}
              />
            </div>
            {/* Scrollable task cards only */}
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ minHeight: '400px', maxHeight: '700px' }}>
              <AssignedTasksList
                tasks={assignedTasks}
                loading={loading}
                onEdit={(task: Task) => {
                  setEditingTaskId(task._id);
                  setTaskTitle(task.title);
                  setTaskDescription(task.description || "");
                  setTaskDeadline(task.deadline);
                  setAssignedTo(
                    typeof task.userId === "string"
                      ? task.userId
                      : (task.userId && task.userId._id) || ""
                  );
                  setImportant(!!task.important);
                  setShowForm(true);
                }}
                onDelete={handleDeleteTask}
                isTaskOverdue={isTaskOverdue}
                currentUserEmail={currentUserEmail}
                cardsOnly
                search={assignedSearch}
                filterStatus={assignedFilterStatus}
                filterImportant={assignedFilterImportant}
                sortBy={assignedSortBy}
              />
            </div>
          </section>
        </div>

        {/* Task Form Modal Overlay */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-0 sm:p-0 max-w-lg w-full relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
                onClick={() => { resetForm(); setShowForm(false); }}
                aria-label="Close form"
              >
                ×
              </button>
              <TaskForm
                show={true}
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
                onCancel={() => { resetForm(); setShowForm(false); }}
              />
            </div>
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
import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaPlus, FaTasks, FaUserCheck } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import AssignedTasksList from "@/components/tasks/AssignedTasksList";
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Task as TaskType } from "@/types/task";

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
  priority: 'critical' | 'high' | 'medium' | 'low'; // Changed from important
  userId: string | TaskUser | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isSubtask?: boolean;
  parentTask?: string;
  subtasks?: Task[];
}

const isTaskOverdue = (task: TaskType): boolean => {
  if (task.completed) return false;
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  deadlineDate.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);
  return deadlineDate < now;
};

type ActiveTab = 'my-tasks' | 'assigned-tasks';

const TasksPage: NextPageWithLayout = React.memo((props) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-tasks');
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<TaskType[]>([]);
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
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [formError, setFormError] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Controlled state for My Task List
  const [mySearch, setMySearch] = useState("");
  const [myFilterStatus, setMyFilterStatus] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [myFilterPriority, setMyFilterPriority] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [mySortBy, setMySortBy] = useState<"createdAtDesc" | "deadlineAsc" | "priorityDesc">("priorityDesc");

  // Controlled state for Assigned Tasks List
  const [assignedSearch, setAssignedSearch] = useState("");
  const [assignedFilterStatus, setAssignedFilterStatus] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [assignedFilterPriority, setAssignedFilterPriority] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [assignedSortBy, setAssignedSortBy] = useState<"createdAtDesc" | "deadlineAsc" | "priorityDesc">("priorityDesc");

  const t = useTranslations("TasksPage");

  // Memoize fetchTasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks.");
      const data: TaskType[] = await response.json();

      // Only tasks assigned to me (by id or email)
      const myTasks = data.filter((task) => {
        if (!task.userId) return false;
        if (typeof task.userId === "string") {
          return (
            task.userId === currentUserId ||
            task.userId.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()
          );
        }
        if (typeof task.userId === "object") {
          if (task.userId._id && String(task.userId._id) === String(currentUserId)) return true;
          if (task.userId.email && task.userId.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) return true;
        }
        return false;
      });

      let sortedData = [...myTasks];
      sortedData.sort((a, b) => {
        const isAOverdue = isTaskOverdue(a);
        const isBOverdue = isTaskOverdue(b);

        if (isAOverdue && !a.completed && (!isBOverdue || b.completed)) return -1;
        if (isBOverdue && !b.completed && (!isAOverdue || a.completed)) return 1;
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        if (aPriority !== bPriority) return bPriority - aPriority;
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
  }, [currentUserId, currentUserEmail, mySortBy]);

  // Memoize fetchAssignedTasks
  const fetchAssignedTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks/assigned-by-me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch assigned tasks.");
      const data: TaskType[] = await response.json();
      setAssignedTasks(data);
    } catch (err) {
      // Optionally handle error
    }
  }, []);

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
    if (currentUserId || currentUserEmail) {
      fetchTasks();
    }
  }, [currentUserId, currentUserEmail, mySortBy]);

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  // Memoize resetForm
  const resetForm = useCallback(() => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setEditingTaskId(null);
    setFormError(null);
    setAssignedTo("");
    setPriority('medium');
  }, []);

  // Memoize handleAddTask
  const handleAddTask = useCallback(async (e: React.FormEvent, subtasks?: any[]) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDeadline.trim()) {
      setFormError(t("taskTitle") + " and " + t("deadline") + " are required!");
      return;
    }
    setLoading(true);
    setFormError(null);

    const taskData: any = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      deadline: taskDeadline,
      ...(assignedTo && { assignedTo }),
      priority,
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

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = "Failed to save task.";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      await fetchTasks();
      await fetchAssignedTasks();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [taskTitle, taskDeadline, taskDescription, assignedTo, priority, editingTaskId, t, fetchTasks, fetchAssignedTasks, resetForm]);

  // Memoize handleDeleteTask
  const handleDeleteTask = useCallback(async (id: string) => {
    if (!window.confirm(t("deleteAnnouncementConfirm", { default: "Are you sure you want to delete this task?" }))) return;
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
  }, [t, fetchTasks]);

  // Memoize handleToggleComplete
  const handleToggleComplete = useCallback(async (task: TaskType) => {
    if (loading) return;
    if (task.subtasks && task.subtasks.length > 0 && !task.isSubtask) {
      alert(t("editingTaskWithSubtasks", { default: "This task has subtasks. Complete all subtasks to automatically complete this task." }));
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

      await fetchTasks();
      await fetchAssignedTasks();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loading, t, fetchTasks, fetchAssignedTasks]);

  // Memoize handleEditClick
  const handleEditClick = useCallback((task: TaskType) => {
    setEditingTaskId(task._id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    const deadlineDate = new Date(task.deadline);
    const formattedDeadline = deadlineDate.toISOString().split('T')[0];
    setTaskDeadline(formattedDeadline);
    setAssignedTo(typeof task.userId === "object" && task.userId ? task.userId._id : (task.userId as string) || "");
    setPriority(task.priority || 'medium');
    setFormError(null);
    setShowForm(true);
  }, [setEditingTaskId, setTaskTitle, setTaskDescription, setTaskDeadline, setAssignedTo, setPriority, setFormError, setShowForm]);

  // Memoize handleClose
  const handleClose = useCallback(() => {
    resetForm();
    setShowForm(false);
  }, [resetForm]);

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header Section - Outside main container */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 lg:px-8 pt-10`}>
        <div className="max-w-[100vw] mx-auto">
          {/* Tab Navigation & Create Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Tab Buttons */}
            <div className={`flex rounded-xl p-1 gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <Button
                type="button"
                onClick={() => setActiveTab('my-tasks')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
                  ${activeTab === 'my-tasks'
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-blue-700'
                      : 'text-gray-600 hover:text-white hover:bg-blue-500'
                  }`}
                variant="ghost"
              >
                <FaTasks className="w-4 h-4" />
                <span>{t("myTasks")}</span>
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab('assigned-tasks')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
                  ${activeTab === 'assigned-tasks'
                    ? theme === 'dark'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-green-700'
                      : 'text-gray-600 hover:text-white hover:bg-green-500'
                  }`}
                variant="ghost"
              >
                <FaUserCheck className="w-4 h-4" />
                <span>{t("assignedByMe")}</span>
              </Button>
            </div>

            {/* Create Task Button */}
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 group ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={loading}
            >
              <FaPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>{t("createTask")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full height */}
      <div className="px-2 lg:px-4 pt-4">
        <div className="max-w-[100vw] mx-auto">
          {/* Tab Content - Dynamic height container */}
          <Card className={`${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-2xl border ${theme === "light" ? "border-gray-200" : "border-gray-700"} overflow-hidden mx-2`}>
            {activeTab === 'my-tasks' ? (
              <div className="flex flex-col">
                {/* My Tasks Header - Compact */}
                <CardHeader className={`p-6 ${theme === "light" ? "bg-blue-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}>
                      <FaTasks className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                        {t("myTasks")}
                      </h2>
                      <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                        {t("myTasksDescription")}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Controls */}
                <CardContent className={`p-3 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
                  <TaskList
                    tasks={tasks}
                    currentUserEmail={currentUserEmail}
                    loading={loading}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    isTaskOverdue={isTaskOverdue}
                    theme={theme}
                    controlsOnly
                    search={mySearch}
                    onSearchChange={setMySearch}
                    filterStatus={myFilterStatus}
                    onFilterStatusChange={setMyFilterStatus}
                    filterPriority={myFilterPriority}
                    onFilterPriorityChange={setMyFilterPriority}
                    sortBy={mySortBy}
                    onSortByChange={setMySortBy}
                  />
                </CardContent>

                {/* Tasks List - Dynamic height with max height and scroll */}
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                  <TaskList
                    tasks={tasks}
                    currentUserEmail={currentUserEmail}
                    loading={loading}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    isTaskOverdue={isTaskOverdue}
                    theme={theme}
                    cardsOnly
                    search={mySearch}
                    filterStatus={myFilterStatus}
                    filterPriority={myFilterPriority}
                    sortBy={mySortBy}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Assigned Tasks Header - Compact */}
                <CardHeader className={`p-6 ${theme === "light" ? "bg-green-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-600' : 'bg-green-500'}`}>
                      <FaUserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                        {t("tasksAssignedByMe")}
                      </h2>
                      <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                        {t("assignedTasksDescription")}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Controls */}
                <CardContent className={`p-3 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
                  <AssignedTasksList
                    tasks={assignedTasks}
                    loading={loading}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTask}
                    isTaskOverdue={isTaskOverdue}
                    currentUserEmail={currentUserEmail}
                    controlsOnly
                    search={assignedSearch}
                    onSearchChange={setAssignedSearch}
                    filterStatus={assignedFilterStatus}
                    onFilterStatusChange={setAssignedFilterStatus}
                    filterPriority={assignedFilterPriority}
                    onFilterPriorityChange={setAssignedFilterPriority}
                    sortBy={assignedSortBy}
                    onSortByChange={setAssignedSortBy}
                  />
                </CardContent>

                {/* Tasks List - Dynamic height with max height and scroll */}
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                  <AssignedTasksList
                    tasks={assignedTasks}
                    loading={loading}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTask}
                    isTaskOverdue={isTaskOverdue}
                    currentUserEmail={currentUserEmail}
                    cardsOnly
                    search={assignedSearch}
                    filterStatus={assignedFilterStatus}
                    filterPriority={assignedFilterPriority}
                    sortBy={assignedSortBy}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] relative animate-fadeIn overflow-hidden">
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
              priority={priority}
              onTitleChange={setTaskTitle}
              onDescriptionChange={setTaskDescription}
              onDeadlineChange={setTaskDeadline}
              onAssignedToChange={setAssignedTo}
              onPriorityChange={setPriority}
              onSubmit={handleAddTask}
              onCancel={handleClose}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

TasksPage.getLayout = function getLayout(page: React.ReactElement) {
  const locale = (page.props as any)?.locale;
  return <DashboardLayout locale={locale}>{page}</DashboardLayout>;
};

export default React.memo(TasksPage);
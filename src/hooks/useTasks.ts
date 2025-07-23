import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
import { useTranslations } from "next-intl";
import { Task as TaskType } from "@/types/task";

export function useTasks() {
  const { theme } = useTheme();
  const t = useTranslations("TasksPage");

  const [activeTab, setActiveTab] = useState<'my-tasks' | 'assigned-tasks'>('my-tasks');
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

  const isTaskOverdue = useCallback((task: TaskType): boolean => {
    if (task.completed) return false;
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    deadlineDate.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    return deadlineDate < now;
  }, []);

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
  }, [currentUserId, currentUserEmail, mySortBy, isTaskOverdue]);

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

  useEffect(() => {
    async function fetchUsersBelow() {
      const res = await fetch("/api/roles-below-me");
      const data = await res.json();
      setUsersBelowMe(data.usersBelow || []);
    }
    fetchUsersBelow();
  }, []);

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

  useEffect(() => {
    if (currentUserId || currentUserEmail) {
      fetchTasks();
    }
  }, [currentUserId, currentUserEmail, mySortBy, fetchTasks]);

  useEffect(() => {
    fetchAssignedTasks();
  }, [fetchAssignedTasks]);

  const resetForm = useCallback(() => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setEditingTaskId(null);
    setFormError(null);
    setAssignedTo("");
    setPriority('medium');
  }, []);

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
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    setShowForm(false);
  }, [resetForm]);

  return {
    theme,
    activeTab,
    setActiveTab,
    tasks,
    assignedTasks,
    usersBelowMe,
    currentUserEmail,
    currentUserId,
    showForm,
    setShowForm,
    editingTaskId,
    setEditingTaskId,
    taskTitle,
    setTaskTitle,
    taskDescription,
    setTaskDescription,
    taskDeadline,
    setTaskDeadline,
    assignedTo,
    setAssignedTo,
    priority,
    setPriority,
    formError,
    setFormError,
    loading,
    listError,
    mySearch,
    setMySearch,
    myFilterStatus,
    setMyFilterStatus,
    myFilterPriority,
    setMyFilterPriority,
    mySortBy,
    setMySortBy,
    assignedSearch,
    setAssignedSearch,
    assignedFilterStatus,
    setAssignedFilterStatus,
    assignedFilterPriority,
    setAssignedFilterPriority,
    assignedSortBy,
    setAssignedSortBy,
    fetchTasks,
    fetchAssignedTasks,
    resetForm,
    handleAddTask,
    handleDeleteTask,
    handleToggleComplete,
    handleEditClick,
    handleClose,
    t,
    isTaskOverdue,
  };
}

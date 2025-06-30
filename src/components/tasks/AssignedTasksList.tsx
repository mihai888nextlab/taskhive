import React, { useState, useMemo } from "react";
import TaskCard from "./TaskCard";
import TaskDetailsModal from "./TaskDetailsModal";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  important?: boolean;
  userId: any;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
}

interface AssignedTasksListProps {
  tasks: Task[];
  currentUserEmail: string;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (task: Task) => void; // Made optional
  isTaskOverdue: (task: Task) => boolean;
  theme?: string;
  controlsOnly?: boolean;
  cardsOnly?: boolean;
  // Controlled state props
  search?: string;
  onSearchChange?: (v: string) => void;
  filterStatus?: "all" | "completed" | "pending" | "overdue";
  onFilterStatusChange?: (v: "all" | "completed" | "pending" | "overdue") => void;
  filterImportant?: "all" | "important" | "not-important";
  onFilterImportantChange?: (v: "all" | "important" | "not-important") => void;
  sortBy?: "createdAtDesc" | "deadlineAsc";
  onSortByChange?: (v: "createdAtDesc" | "deadlineAsc") => void;
}

const AssignedTasksList: React.FC<AssignedTasksListProps> = ({
  tasks,
  currentUserEmail,
  loading,
  onEdit,
  onDelete,
  onToggleComplete,
  isTaskOverdue,
  theme = "light",
  controlsOnly = false,
  cardsOnly = false,
  search: controlledSearch,
  onSearchChange,
  filterStatus: controlledFilterStatus,
  onFilterStatusChange,
  filterImportant: controlledFilterImportant,
  onFilterImportantChange,
  sortBy: controlledSortBy,
  onSortByChange,
}) => {
  // Controlled or local state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [filterImportant, setFilterImportant] = useState<"all" | "important" | "not-important">("all");
  const [sortBy, setSortBy] = useState<"createdAtDesc" | "deadlineAsc">("deadlineAsc");
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const searchValue = controlledSearch !== undefined ? controlledSearch : search;
  const filterStatusValue = controlledFilterStatus !== undefined ? controlledFilterStatus : filterStatus;
  const filterImportantValue = controlledFilterImportant !== undefined ? controlledFilterImportant : filterImportant;
  const sortByValue = controlledSortBy !== undefined ? controlledSortBy : sortBy;

  const handleShowDetails = (task: Task) => {
    setDetailsTask(task);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setDetailsTask(null);
  };

  // Fetch a single task by ID
  const fetchTaskById = async (id: string) => {
    const res = await fetch(`/api/tasks?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch task");
    return await res.json();
  };

  // Wrap onToggleComplete to also refetch the task and update the modal
  const handleToggleComplete = async (task: Task) => {
    if (onToggleComplete) await onToggleComplete(task);
    // Refetch the updated task and update the modal if open and this is the task
    if (modalOpen && detailsTask && detailsTask._id === task._id) {
      const updatedTask = await fetchTaskById(task._id);
      setDetailsTask(updatedTask);
    }
  };

  // Helper function to check if user can complete a task
  const canUserCompleteTask = (task: Task) => {
    const assignerEmail = (task.createdBy?.email || "").trim().toLowerCase();
    const userEmail = (currentUserEmail || "").trim().toLowerCase();
    const canEditOrDelete = assignerEmail === userEmail;
    
    const taskAssigneeEmail = typeof task.userId === 'object' && task.userId?.email ? task.userId.email.trim().toLowerCase() : '';
    const isAssignedToMe = taskAssigneeEmail === userEmail || (typeof task.userId === 'string' && task.userId === userEmail);
    
    return canEditOrDelete || isAssignedToMe;
  };

  // Filtering, searching, sorting logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (searchValue.trim()) {
      const q = searchValue.trim().toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    // Filter by status
    result = result.filter(task => {
      if (filterStatusValue === "completed") return task.completed;
      if (filterStatusValue === "pending") return !task.completed && !isTaskOverdue(task);
      if (filterStatusValue === "overdue") return isTaskOverdue(task) && !task.completed;
      // For 'all', only show overdue and pending (not completed)
      if (filterStatusValue === "all") return !task.completed;
      return true;
    });

    // Filter by importance
    result = result.filter(task => {
      if (filterImportantValue === "important") return !!task.important;
      if (filterImportantValue === "not-important") return !task.important;
      return true;
    });

    // Sort: Overdue first, then important, then by sortBy
    result.sort((a, b) => {
      const isAOverdue = isTaskOverdue(a);
      const isBOverdue = isTaskOverdue(b);

      // 1. Overdue tasks (not completed) first
      if (isAOverdue && !a.completed && (!isBOverdue || b.completed)) return -1;
      if (isBOverdue && !b.completed && (!isAOverdue || a.completed)) return 1;

      // 2. Important tasks (not completed, not overdue) next
      if (a.important && !a.completed && !isAOverdue && (!b.important || b.completed || isBOverdue)) return -1;
      if (b.important && !b.completed && !isBOverdue && (!a.important || a.completed || isAOverdue)) return 1;

      // 3. Then by completion
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      // 4. Then by sortBy
      if (sortByValue === "deadlineAsc") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      // Default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tasks, searchValue, filterStatusValue, filterImportantValue, sortByValue, isTaskOverdue]);

  // All labels and inputs/selects use black text
  const labelClass = "font-semibold text-sm text-black";
  const inputClass = "ml-2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary bg-inherit text-black";
  const selectClass = "ml-2 rounded px-2 py-1 border border-gray-300 bg-inherit text-black";

  if (controlsOnly) {
    return (
      <div
        className="w-full flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-4 mb-0 p-4 rounded-2xl shadow-sm bg-gray-50/80 border border-gray-100 box-border"
        style={{ maxWidth: '100%' }}
      >
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchValue}
          onChange={e => {
            if (onSearchChange) onSearchChange(e.target.value);
            else setSearch(e.target.value);
          }}
          className="flex-1 min-w-[120px] max-w-xs px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base placeholder-gray-400 outline-none"
        />
        <select
          value={filterStatusValue}
          onChange={e => {
            if (onFilterStatusChange) onFilterStatusChange(e.target.value as any);
            else setFilterStatus(e.target.value as any);
          }}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="all">Status: All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={filterImportantValue}
          onChange={e => {
            if (onFilterImportantChange) onFilterImportantChange(e.target.value as any);
            else setFilterImportant(e.target.value as any);
          }}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="all">Important: All</option>
          <option value="important">Important</option>
          <option value="not-important">Not Important</option>
        </select>
        <select
          value={sortByValue}
          onChange={e => {
            if (onSortByChange) onSortByChange(e.target.value as any);
            else setSortBy(e.target.value as any);
          }}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="createdAtDesc">Sort: Newest First</option>
          <option value="deadlineAsc">Sort: Deadline</option>
        </select>
      </div>
    );
  }
  if (cardsOnly) {
    return (
      <>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
          {filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              currentUserEmail={currentUserEmail}
              loading={loading}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={canUserCompleteTask(task) ? handleToggleComplete : undefined}
              isTaskOverdue={isTaskOverdue}
              onShowDetails={handleShowDetails}
            />
          ))}
        </div>
        <TaskDetailsModal
          open={modalOpen}
          task={detailsTask}
          onClose={handleCloseModal}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete || (() => {})}
        />
      </>
    );
  }

  return (
    <>
      {/* Minimalist Controls - always fit in parent */}
      <div
        className="w-full flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-4 mb-8 p-4 rounded-2xl shadow-sm bg-gray-50/80 border border-gray-100 box-border"
        style={{maxWidth: '100%'}}
      >
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchValue}
          onChange={e => {
            if (onSearchChange) onSearchChange(e.target.value);
            else setSearch(e.target.value);
          }}
          className="flex-1 min-w-[120px] max-w-xs px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base placeholder-gray-400 outline-none"
        />
        <select
          value={filterStatusValue}
          onChange={e => {
            if (onFilterStatusChange) onFilterStatusChange(e.target.value as any);
            else setFilterStatus(e.target.value as any);
          }}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="all">Status: All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={filterImportantValue}
          onChange={e => {
            if (onFilterImportantChange) onFilterImportantChange(e.target.value as any);
            else setFilterImportant(e.target.value as any);
          }}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="all">Important: All</option>
          <option value="important">Important</option>
          <option value="not-important">Not Important</option>
        </select>
        <select
          value={sortByValue}
          onChange={e => {
            if (onSortByChange) onSortByChange(e.target.value as any);
            else setSortBy(e.target.value as any);
          }}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="createdAtDesc">Sort: Newest First</option>
          <option value="deadlineAsc">Sort: Deadline</option>
        </select>
      </div>
      {/* Task List */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-12">
          <span className="text-lg text-gray-500">Loading tasks...</span>
        </div>
      ) : !filteredTasks.length ? (
        <div className="w-full flex justify-center items-center py-12">
          <span className="text-lg text-gray-400">No tasks found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
          {filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              currentUserEmail={currentUserEmail}
              loading={loading}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={canUserCompleteTask(task) && onToggleComplete ? handleToggleComplete : undefined}
              isTaskOverdue={isTaskOverdue}
              onShowDetails={handleShowDetails}
            />
          ))}
        </div>
      )}
      <TaskDetailsModal
        open={modalOpen}
        task={detailsTask}
        onClose={handleCloseModal}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete || (() => {})}
      />
    </>
  );
};

export default AssignedTasksList;
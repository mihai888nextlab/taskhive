import React, { useState, useMemo } from "react";
import TaskCard from "./TaskCard";

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

interface TaskListProps {
  tasks: Task[];
  currentUserEmail: string;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  isTaskOverdue: (task: Task) => boolean;
  theme?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentUserEmail,
  loading,
  onEdit,
  onDelete,
  onToggleComplete,
  isTaskOverdue,
  theme = "light",
}) => {
  // Search, filter, sort state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [filterImportant, setFilterImportant] = useState<"all" | "important" | "not-important">("all");
  const [sortBy, setSortBy] = useState<"createdAtDesc" | "deadlineAsc">("createdAtDesc");

  // Filtering, searching, sorting logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    // Filter by status
    result = result.filter(task => {
      if (filterStatus === "completed") return task.completed;
      if (filterStatus === "pending") return !task.completed && !isTaskOverdue(task);
      if (filterStatus === "overdue") return isTaskOverdue(task) && !task.completed;
      return true;
    });

    // Filter by importance
    result = result.filter(task => {
      if (filterImportant === "important") return !!task.important;
      if (filterImportant === "not-important") return !task.important;
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
      if (sortBy === "deadlineAsc") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      // Default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tasks, search, filterStatus, filterImportant, sortBy, isTaskOverdue]);

  // All labels and inputs/selects use black text
  const labelClass = "font-semibold text-sm text-black";
  const inputClass = "ml-2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary bg-inherit text-black";
  const selectClass = "ml-2 rounded px-2 py-1 border border-gray-300 bg-inherit text-black";

  return (
    <div>
      {/* Controls */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 rounded-xl shadow ${
          theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex-1 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <label className={labelClass + " flex-shrink-0"}>
            Search:
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-end">
          <label className={labelClass}>
            Status:
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>
          <label className={labelClass}>
            Important:
            <select
              value={filterImportant}
              onChange={e => setFilterImportant(e.target.value as any)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="important">Important</option>
              <option value="not-important">Not Important</option>
            </select>
          </label>
          <label className={labelClass}>
            Sort by:
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className={selectClass}
            >
              <option value="createdAtDesc">Created Date (Newest First)</option>
              <option value="deadlineAsc">Deadline (Earliest First)</option>
            </select>
          </label>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              currentUserEmail={currentUserEmail}
              loading={loading}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              isTaskOverdue={isTaskOverdue}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
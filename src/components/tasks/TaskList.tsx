import React, { useState, useMemo } from "react";
import TaskCard from "./TaskCard";
import TaskDetailsModal from "./TaskDetailsModal";
import { FaSearch, FaSpinner, FaTasks } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  priority: "critical" | "high" | "medium" | "low";
  userId: any;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  isSubtask?: boolean;
  parentTask?: string;
  subtasks?: Task[];
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
  controlsOnly?: boolean;
  cardsOnly?: boolean;
  // Controlled state props
  search?: string;
  onSearchChange?: (v: string) => void;
  filterStatus?: "all" | "completed" | "pending" | "overdue";
  onFilterStatusChange?: (v: "all" | "completed" | "pending" | "overdue") => void;
  filterPriority?: "all" | "critical" | "high" | "medium" | "low";
  onFilterPriorityChange?: (v: "all" | "critical" | "high" | "medium" | "low") => void;
  sortBy?: "createdAtDesc" | "deadlineAsc" | "priorityDesc";
  onSortByChange?: (v: "createdAtDesc" | "deadlineAsc" | "priorityDesc") => void;
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
  controlsOnly = false,
  cardsOnly = false,
  search: controlledSearch,
  onSearchChange,
  filterStatus: controlledFilterStatus,
  onFilterStatusChange,
  filterPriority: controlledFilterPriority,
  onFilterPriorityChange,
  sortBy: controlledSortBy,
  onSortByChange,
}) => {
  // Controlled or local state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [sortBy, setSortBy] = useState<"createdAtDesc" | "deadlineAsc" | "priorityDesc">("priorityDesc");
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const searchValue = controlledSearch !== undefined ? controlledSearch : search;
  const filterStatusValue = controlledFilterStatus !== undefined ? controlledFilterStatus : filterStatus;
  const filterPriorityValue = controlledFilterPriority !== undefined ? controlledFilterPriority : filterPriority;
  const sortByValue = controlledSortBy !== undefined ? controlledSortBy : sortBy;

  const handleShowDetails = (task: Task) => {
    setDetailsTask(task);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setDetailsTask(null);
  };

  const handleSubtaskToggle = async (subtask: Task) => {
    // Call the same toggle function
    await onToggleComplete(subtask);
    
    // Update the detailsTask with the updated task from the tasks array
    if (detailsTask) {
      const updatedMainTask = tasks.find(t => t._id === detailsTask._id);
      if (updatedMainTask) {
        setDetailsTask(updatedMainTask);
      }
    }
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

    // Filter by priority
    result = result.filter(task => {
      if (filterPriorityValue === "critical") return task.priority === "critical";
      if (filterPriorityValue === "high") return task.priority === "high";
      if (filterPriorityValue === "medium") return task.priority === "medium";
      if (filterPriorityValue === "low") return task.priority === "low";
      return true;
    });

    // Sort with priority as primary factor
    result.sort((a, b) => {
      const isAOverdue = isTaskOverdue(a);
      const isBOverdue = isTaskOverdue(b);

      // 1. Overdue tasks (not completed) first
      if (isAOverdue && !a.completed && (!isBOverdue || b.completed)) return -1;
      if (isBOverdue && !b.completed && (!isAOverdue || a.completed)) return 1;

      // 2. Then by priority (critical > high > medium > low)
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      // 3. Then by completion
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      // 4. Then by sortBy
      if (sortByValue === "deadlineAsc") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortByValue === "priorityDesc") {
        return bPriority - aPriority;
      }
      // Default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tasks, searchValue, filterStatusValue, filterPriorityValue, sortByValue, isTaskOverdue]);

  if (controlsOnly) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative">
          <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={e => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setSearch(e.target.value);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <Select
          value={filterStatusValue}
          onValueChange={v => {
            if (onFilterStatusChange) onFilterStatusChange(v as any);
            else setFilterStatus(v as any);
          }}
        >
          <select
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={filterStatusValue}
            onChange={e => {
              if (onFilterStatusChange) onFilterStatusChange(e.target.value as any);
              else setFilterStatus(e.target.value as any);
            }}
          >
            <option value="all">Status: All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </Select>
        <Select
          value={filterPriorityValue}
          onValueChange={v => {
            if (onFilterPriorityChange) onFilterPriorityChange(v as any);
            else setFilterPriority(v as any);
          }}
        >
          <select
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={filterPriorityValue}
            onChange={e => {
              if (onFilterPriorityChange) onFilterPriorityChange(e.target.value as any);
              else setFilterPriority(e.target.value as any);
            }}
          >
            <option value="all">Priority: All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Select>
        <Select
          value={sortByValue}
          onValueChange={v => {
            if (onSortByChange) onSortByChange(v as any);
            else setSortBy(v as any);
          }}
        >
          <select
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={sortByValue}
            onChange={e => {
              if (onSortByChange) onSortByChange(e.target.value as any);
              else setSortBy(e.target.value as any);
            }}
          >
            <option value="createdAtDesc">Sort: Newest First</option>
            <option value="deadlineAsc">Sort: Deadline</option>
            <option value="priorityDesc">Sort: Priority</option>
          </select>
        </Select>
      </div>
    );
  }

  if (cardsOnly) {
    return (
      <>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <FaTasks className="text-6xl text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Found</h4>
              <p className="text-gray-500">
                {searchValue.trim() ? "Try adjusting your search or filters" : "Create your first task to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
                  onShowDetails={handleShowDetails}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>
        <TaskDetailsModal
          open={modalOpen}
          task={detailsTask}
          onClose={handleCloseModal}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete || (() => {})}
          onToggleSubtask={handleSubtaskToggle}
          theme={theme}
          currentUserEmail={currentUserEmail}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={e => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setSearch(e.target.value);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <Select
          value={filterStatusValue}
          onValueChange={v => {
            if (onFilterStatusChange) onFilterStatusChange(v as any);
            else setFilterStatus(v as any);
          }}
        >
          <select
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={filterStatusValue}
            onChange={e => {
              if (onFilterStatusChange) onFilterStatusChange(e.target.value as any);
              else setFilterStatus(e.target.value as any);
            }}
          >
            <option value="all">Status: All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </Select>
        <Select
          value={filterPriorityValue}
          onValueChange={v => {
            if (onFilterPriorityChange) onFilterPriorityChange(v as any);
            else setFilterPriority(v as any);
          }}
        >
          <select
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={filterPriorityValue}
            onChange={e => {
              if (onFilterPriorityChange) onFilterPriorityChange(e.target.value as any);
              else setFilterPriority(e.target.value as any);
            }}
          >
            <option value="all">Priority: All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Select>
        <Select
          value={sortByValue}
          onValueChange={v => {
            if (onSortByChange) onSortByChange(v as any);
            else setSortBy(v as any);
          }}
        >
          <select
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={sortByValue}
            onChange={e => {
              if (onSortByChange) onSortByChange(e.target.value as any);
              else setSortBy(e.target.value as any);
            }}
          >
            <option value="createdAtDesc">Sort: Newest First</option>
            <option value="deadlineAsc">Sort: Deadline</option>
            <option value="priorityDesc">Sort: Priority</option>
          </select>
        </Select>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <FaTasks className="text-6xl text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Found</h4>
            <p className="text-gray-500">
              {searchValue.trim() ? "Try adjusting your search or filters" : "Create your first task to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                onShowDetails={handleShowDetails}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
      <TaskDetailsModal
        open={modalOpen}
        task={detailsTask}
        onClose={handleCloseModal}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete || (() => {})}
        onToggleSubtask={handleSubtaskToggle}
        theme={theme}
        currentUserEmail={currentUserEmail}
      />
    </>
  );
};

export default TaskList;
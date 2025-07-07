import React, { useState, useMemo } from "react";
import TaskCard from "./TaskCard";
import TaskDetailsModal from "./TaskDetailsModal";
import { FaSearch, FaSpinner, FaTasks } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userId: any;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  // Add subtask fields
  isSubtask?: boolean;
  parentTask?: string;
  subtasks?: Task[];
}

interface AssignedTasksListProps {
  tasks: Task[];
  currentUserEmail: string;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (task: Task) => void;
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
      const aPriority = priorityOrder[a.priority ?? "medium"];
      const bPriority = priorityOrder[b.priority ?? "medium"];
      
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
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by title or description..."
            value={searchValue}
            onChange={e => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setSearch(e.target.value);
            }}
            className={`w-full pl-10 pr-4 text-sm rounded-xl border transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            style={{ height: "36px" }}
          />
        </div>
        <Select
          value={filterStatusValue}
          onValueChange={v => {
            if (onFilterStatusChange) onFilterStatusChange(v as any);
            else setFilterStatus(v as any);
          }}
        >
          <SelectTrigger className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
            style={{ height: "36px" }}
          >
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Status: All</SelectItem>
            <SelectItem value="completed" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Completed</SelectItem>
            <SelectItem value="pending" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Pending</SelectItem>
            <SelectItem value="overdue" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterPriorityValue}
          onValueChange={v => {
            if (onFilterPriorityChange) onFilterPriorityChange(v as any);
            else setFilterPriority(v as any);
          }}
        >
          <SelectTrigger className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
            style={{ height: "36px" }}
          >
            <SelectValue placeholder="Priority: All" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Priority: All</SelectItem>
            <SelectItem value="critical" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Critical</SelectItem>
            <SelectItem value="high" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">High</SelectItem>
            <SelectItem value="medium" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Medium</SelectItem>
            <SelectItem value="low" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortByValue}
          onValueChange={v => {
            if (onSortByChange) onSortByChange(v as any);
            else setSortBy(v as any);
          }}
        >
          <SelectTrigger className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]"
            style={{ height: "36px" }}
          >
            <SelectValue placeholder="Sort: Newest First" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="createdAtDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Sort: Newest First</SelectItem>
            <SelectItem value="deadlineAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Sort: Deadline</SelectItem>
            <SelectItem value="priorityDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Sort: Priority</SelectItem>
          </SelectContent>
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
                {searchValue.trim() ? "Try adjusting your search or filters" : "No assigned tasks found"}
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
                  onToggleComplete={canUserCompleteTask(task) ? onToggleComplete : undefined}
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
          onToggleSubtask={onToggleComplete}
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
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by title or description..."
            value={searchValue}
            onChange={e => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setSearch(e.target.value);
            }}
            className={`w-full pl-10 pr-4 text-sm rounded-xl border transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            style={{ height: "36px" }}
          />
        </div>
        <Select
          value={filterStatusValue}
          onValueChange={v => {
            if (onFilterStatusChange) onFilterStatusChange(v as any);
            else setFilterStatus(v as any);
          }}
        >
          <SelectTrigger className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
            style={{ height: "36px" }}
          >
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Status: All</SelectItem>
            <SelectItem value="completed" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Completed</SelectItem>
            <SelectItem value="pending" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Pending</SelectItem>
            <SelectItem value="overdue" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterPriorityValue}
          onValueChange={v => {
            if (onFilterPriorityChange) onFilterPriorityChange(v as any);
            else setFilterPriority(v as any);
          }}
        >
          <SelectTrigger className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
            style={{ height: "36px" }}
          >
            <SelectValue placeholder="Priority: All" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Priority: All</SelectItem>
            <SelectItem value="critical" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Critical</SelectItem>
            <SelectItem value="high" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">High</SelectItem>
            <SelectItem value="medium" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Medium</SelectItem>
            <SelectItem value="low" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortByValue}
          onValueChange={v => {
            if (onSortByChange) onSortByChange(v as any);
            else setSortBy(v as any);
          }}
        >
          <SelectTrigger className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]"
            style={{ height: "36px" }}
          >
            <SelectValue placeholder="Sort: Newest First" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="createdAtDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Sort: Newest First</SelectItem>
            <SelectItem value="deadlineAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Sort: Deadline</SelectItem>
            <SelectItem value="priorityDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Sort: Priority</SelectItem>
          </SelectContent>
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
              {searchValue.trim() ? "Try adjusting your search or filters" : "No assigned tasks found"}
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
                onToggleComplete={canUserCompleteTask(task) ? onToggleComplete : undefined}
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
        onToggleSubtask={onToggleComplete}
        theme={theme}
        currentUserEmail={currentUserEmail}
      />
    </>
  );
};

export default AssignedTasksList;
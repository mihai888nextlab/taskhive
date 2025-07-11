import React, { useState, useMemo } from "react";
import TaskCard from "./TaskCard";
import TaskDetailsModal from "./TaskDetailsModal";
import { FaSearch, FaSpinner, FaTasks } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Task } from "@/types/task";

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
  const t = useTranslations("TasksPage");

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
    let result: Task[] = [];

    // 1. Include main tasks assigned to me
    result = tasks.filter(task => {
      if (!task.userId) return false;
      // Accept both _id and email for userId
      if (typeof task.userId === "object" && (task.userId._id || task.userId.email)) {
        if (task.userId._id && String(task.userId._id) === String(currentUserEmail)) return true;
        if (task.userId.email && task.userId.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) return true;
      }
      if (typeof task.userId === "string") {
        // Accept both userId and email as string
        return (
          task.userId === currentUserEmail ||
          task.userId.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()
        );
      }
      return false;
    });

    // 2. Also include subtasks assigned to me, but only if main task is NOT created/assigned by me
    const subtasksAssignedToMe: Task[] = [];
    tasks.forEach(task => {
      // Check if main task is NOT created/assigned by me
      const isCreatedByMe =
        task.createdBy &&
        typeof task.createdBy.email === "string" &&
        task.createdBy.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase();

      const isAssignedByMe =
        task.userId &&
        (
          (typeof task.userId === "object" && task.userId.email && task.userId.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) ||
          (typeof task.userId === "string" && (task.userId === currentUserEmail || task.userId.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()))
        );

      if (!isCreatedByMe && !isAssignedByMe && task.subtasks && Array.isArray(task.subtasks)) {
        task.subtasks.forEach(subtask => {
          if (
            subtask.userId &&
            (
              (typeof subtask.userId === "object" && (subtask.userId._id && String(subtask.userId._id) === String(currentUserEmail)) ||
                (subtask.userId.email && subtask.userId.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase())) ||
              (typeof subtask.userId === "string" && (subtask.userId === currentUserEmail || subtask.userId.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()))
            )
          ) {
            subtasksAssignedToMe.push({
              ...subtask,
              createdBy: task.createdBy,
              priority: subtask.priority || task.priority,
              tags: subtask.tags || task.tags,
              parentTask: typeof task._id === "string" ? task._id : undefined,
              subtasks: undefined,
              isSubtask: true,
            });
          }
        });
      }
    });

    // Combine main tasks and filtered subtasks assigned to me
    result = [...result, ...subtasksAssignedToMe];

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
      if (filterPriorityValue === "medium" ) return task.priority === "medium";
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
  }, [tasks, searchValue, filterStatusValue, filterPriorityValue, sortByValue, isTaskOverdue, currentUserEmail]);

  if (controlsOnly) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder={t("searchTasksPlaceholder", { default: "Search by title or description..." })}
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
            <SelectValue placeholder={t("statusAll")} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("statusAll")}</SelectItem>
            <SelectItem value="completed" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("completed")}</SelectItem>
            <SelectItem value="pending" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("pending")}</SelectItem>
            <SelectItem value="overdue" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("overdue")}</SelectItem>
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
            <SelectValue placeholder={t("priorityAll")} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("priorityAll")}</SelectItem>
            <SelectItem value="critical" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("critical")}</SelectItem>
            <SelectItem value="high" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("high")}</SelectItem>
            <SelectItem value="medium" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("medium")}</SelectItem>
            <SelectItem value="low" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("low")}</SelectItem>
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
            <SelectValue placeholder={t("sortNewest")} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="createdAtDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("sortNewest")}</SelectItem>
            <SelectItem value="deadlineAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("sortDeadline")}</SelectItem>
            <SelectItem value="priorityDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("sortPriority")}</SelectItem>
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
              <p className="text-gray-500 text-lg">{t("loadingTasks")}</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <FaTasks className="text-6xl text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("noTasksFound")}</h4>
              <p className="text-gray-500">
                {searchValue.trim() ? t("tryAdjustingSearch") : t("createFirstTask")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={{
                    ...task,
                    parentTask:
                      typeof task.parentTask === "object" && task.parentTask && "_id" in task.parentTask
                        ? task.parentTask._id
                        : typeof task.parentTask === "string"
                          ? task.parentTask
                          : undefined,
                    subtasks: Array.isArray(task.subtasks)
                      ? task.subtasks.map(st => ({
                          ...st,
                          parentTask:
                            typeof st.parentTask === "object" && st.parentTask && "_id" in st.parentTask
                              ? st.parentTask._id
                              : typeof st.parentTask === "string"
                                ? st.parentTask
                                : undefined,
                          subtasks: undefined // Prevent nested subtasks for type compatibility
                        }))
                      : undefined
                  }}
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
        {/* Only render TaskDetailsModal if detailsTask is not null */}
        {detailsTask && (
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
        )}
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
            placeholder={t("searchTasksPlaceholder", { default: "Search by title or description..." })}
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
            <SelectValue placeholder={t("statusAll")} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("statusAll")}</SelectItem>
            <SelectItem value="completed" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("completed")}</SelectItem>
            <SelectItem value="pending" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("pending")}</SelectItem>
            <SelectItem value="overdue" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("overdue")}</SelectItem>
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
            <SelectValue placeholder={t("priorityAll")} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("priorityAll")}</SelectItem>
            <SelectItem value="critical" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("critical")}</SelectItem>
            <SelectItem value="high" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("high")}</SelectItem>
            <SelectItem value="medium" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("medium")}</SelectItem>
            <SelectItem value="low" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("low")}</SelectItem>
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
            <SelectValue placeholder={t("sortNewest")} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="createdAtDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("sortNewest")}</SelectItem>
            <SelectItem value="deadlineAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("sortDeadline")}</SelectItem>
            <SelectItem value="priorityDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("sortPriority")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t("loadingTasks")}</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <FaTasks className="text-6xl text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("noTasksFound")}</h4>
            <p className="text-gray-500">
              {searchValue.trim() ? t("tryAdjustingSearch") : t("createFirstTask")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={{
                  ...task,
                  parentTask:
                    typeof task.parentTask === "object" && task.parentTask && "_id" in task.parentTask
                      ? task.parentTask._id
                      : typeof task.parentTask === "string"
                        ? task.parentTask
                        : undefined,
                  subtasks: Array.isArray(task.subtasks)
                    ? task.subtasks.map(st => ({
                        ...st,
                        parentTask:
                          typeof st.parentTask === "object" && st.parentTask && "_id" in st.parentTask
                            ? st.parentTask._id
                            : typeof st.parentTask === "string"
                              ? st.parentTask
                              : undefined,
                        subtasks: undefined // Prevent nested subtasks for type compatibility
                      }))
                    : undefined
                }}
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
      {/* Only render TaskDetailsModal if detailsTask is not null */}
      {detailsTask && (
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
      )}
    </>
  );
};

export default TaskList;
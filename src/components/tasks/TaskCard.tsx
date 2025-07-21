import React, { useState, useMemo, useCallback } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaExclamationTriangle, FaFlag, FaTasks } from "react-icons/fa";
import { FiCalendar, FiUser, FiChevronDown, FiChevronRight } from "react-icons/fi";
import TimeTrackingModal from "../time-tracking/TimeTrackingModal";
import { Card, CardContent } from "@/components/ui/card";
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
  timeTracking?: { title: string; duration: number; description: string };
  isSubtask?: boolean;
  parentTask?: string;
  subtasks?: Task[];
  important?: boolean;
  assignedTo?: string | { _id: string; firstName?: string; lastName?: string; email?: string };
  tags?: string[];
}

interface TaskCardProps {
  task: Task;
  currentUserEmail: string;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (task: Task) => void;
  isTaskOverdue: (task: Task) => boolean;
  forceAllowEditDelete?: boolean;
  onShowDetails?: (task: Task) => void;
  theme?: string;
}


const TaskCard: React.FC<TaskCardProps> = React.memo(({
  task,
  currentUserEmail,
  loading,
  onEdit,
  onDelete,
  onToggleComplete,
  isTaskOverdue,
  forceAllowEditDelete,
  onShowDetails,
  theme = "light",
  ...props
}) => {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingComplete, setPendingComplete] = useState<null | Task>(null);
  const [showSubtasks, setShowSubtasks] = useState(false);
  // Translation function for tags (DashboardPage)
  let t: (key: string, opts?: any) => string = (props as any)?.t || ((key: string, opts?: any) => key);
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useTranslations } = require('next-intl');
    t = useTranslations('DashboardPage');
  } catch (e) {}

  // Memoize computed values
  const isOverdue = useMemo(() => isTaskOverdue(task), [isTaskOverdue, task]);
  const isCompleted = task.completed;
  const deadlineDate = useMemo(() => new Date(task.deadline), [task.deadline]);
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  deadlineDate.setHours(0, 0, 0, 0);
  const isToday = useMemo(() => !isOverdue && deadlineDate.getTime() === now.getTime(), [isOverdue, deadlineDate, now]);

  const assignerEmail = (task.createdBy?.email || "").trim().toLowerCase();
  const userEmail = (currentUserEmail || "").trim().toLowerCase();
  const canEditOrDelete = assignerEmail === userEmail || forceAllowEditDelete;

  const taskAssigneeEmail = typeof task.userId === 'object' && task.userId?.email ? task.userId.email.trim().toLowerCase() : '';
  const isAssignedToMe = taskAssigneeEmail === userEmail || (typeof task.userId === 'string' && task.userId === userEmail);
  
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const hasSubtasks = totalSubtasks > 0;

  const canComplete = isAssignedToMe && !hasSubtasks;

  // Memoize event handlers
  const handleCompleteClick = useCallback((task: Task) => {
    if (!task.completed) {
      setPendingComplete(task);
      setShowTimeModal(true);
    } else if (onToggleComplete) {
      onToggleComplete(task);
    }
  }, [onToggleComplete, pendingComplete]);

  const handleTimeModalSubmit = useCallback(async (data: { title: string; duration: number; description: string; tag: string }) => {
    setShowTimeModal(false);
    if (pendingComplete) {
      try {
        await fetch('/api/time-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: pendingComplete.userId?._id || pendingComplete.userId,
            name: data.title,
            description: data.description,
            duration: data.duration,
            tag: data.tag,
          }),
        });
      } catch (err) {
        console.error('Failed to save time session', err);
      }
      if (onToggleComplete) {
        onToggleComplete(pendingComplete);
      }
    }
    setPendingComplete(null);
  }, [pendingComplete, onToggleComplete]);

  const handleTimeModalClose = useCallback(() => {
    setShowTimeModal(false);
    if (pendingComplete && onToggleComplete) {
      onToggleComplete(pendingComplete);
    }
    setPendingComplete(null);
  }, [pendingComplete, onToggleComplete]);

  const getAssigneeAvatar = () => {
    if (task.userId && typeof task.userId === 'object') {
      const firstName = task.userId.firstName || '';
      const lastName = task.userId.lastName || '';
      const initials = (firstName[0] || '') + (lastName[0] || '');
      return (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
          theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {initials || 'U'}
        </div>
      );
    }
    return null;
  };

  const getPriorityIndicator = () => {
    if (isOverdue) return 'border-l-red-500';
    switch (task.priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return theme === 'dark' ? 'border-l-gray-700' : 'border-l-gray-200';
    }
  };

  const getPriorityBadge = () => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
          <FaExclamationTriangle className="w-3 h-3" />
          {t("overdue", { default: "Overdue" })}
        </span>
      );
    }

    if (task.priority === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
          🔥 {t("critical", { default: "Critical" })}
        </span>
      );
    }

    if (task.priority === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
          ⚡ {t("highPriority", { default: "High Priority" })}
        </span>
      );
    }

    if (isToday && (task.priority === 'medium' || task.priority === 'low')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
          <FiCalendar className="w-3 h-3" />
          {t("dueToday", { default: "Due Today" })}
        </span>
      );
    }

    return null;
  };

  return (
    <>
      <div className="">
        <Card className="w-full bg-transparent shadow-none border-none p-0 m-0">
          <CardContent className="p-0 m-0">
            <div
              className={`relative p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md group cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } ${getPriorityIndicator()} ${isCompleted ? 'opacity-60' : ''}`}
              onClick={() => onShowDetails && onShowDetails(task)}
            >
              <div className="flex items-start gap-3">
                {/* Complete Button */}
                {onToggleComplete && (
                  <Button
                    type="button"
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (hasSubtasks && !task.isSubtask) {
                        alert("Complete all subtasks to automatically complete this task.");
                        return;
                      }
                      handleCompleteClick(task); 
                    }}
                    className={`flex-shrink-0 mt-1 transition-all duration-200 bg-transparent border-none shadow-none p-0 ${
                      hasSubtasks && !task.isSubtask ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                    disabled={loading || (hasSubtasks && !task.isSubtask && !canComplete)}
                    variant="ghost"
                    style={{
                      backgroundColor: "transparent",
                      // Prevent background on hover/focus/active
                    }}
                  >
                    {isCompleted ? (
                      <FaCheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <FaRegCircle className={`w-5 h-5 transition-colors ${
                        isOverdue ? 'text-red-500' : theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'
                      }`} />
                    )}
                  </Button>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold text-base leading-tight ${
                          isCompleted 
                            ? 'line-through text-gray-500' 
                            : theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h3>
                        {/* Priority & Status Indicators */}
                        {getPriorityBadge()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        type="button"
                        onClick={e => { e.stopPropagation(); onEdit(task); }}
                        className={`w-8 h-8 p-0 rounded-md transition-colors border-none shadow-none flex items-center justify-center
                          ${theme === 'dark'
                            ? 'bg-transparent hover:bg-transparent text-gray-400 hover:text-blue-400'
                            : 'bg-transparent hover:bg-transparent text-gray-500 hover:text-blue-600'
                          }`}
                        title="Edit Task"
                        disabled={loading || !canEditOrDelete}
                        variant="ghost"
                        style={{ minWidth: 32, minHeight: 32, backgroundColor: "transparent" }}
                      >
                        <FaEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={e => { e.stopPropagation(); onDelete(task._id); }}
                        className={`w-8 h-8 p-0 rounded-md transition-colors border-none shadow-none flex items-center justify-center
                          ${theme === 'dark'
                            ? 'bg-transparent hover:bg-transparent text-gray-400 hover:text-red-400'
                            : 'bg-transparent hover:bg-transparent text-gray-500 hover:text-red-600'
                          }`}
                        title="Delete Task"
                        disabled={loading || !canEditOrDelete}
                        variant="ghost"
                        style={{ minWidth: 32, minHeight: 32, backgroundColor: "transparent" }}
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description.length > 80 
                        ? `${task.description.substring(0, 80)}...`
                        : task.description
                      }
                    </p>
                  )}

                  {/* Subtasks Progress */}
                  {hasSubtasks && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Subtasks
                        </span>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {completedSubtasks}/{totalSubtasks}
                        </span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-1.5 rounded-full bg-green-500 transition-all duration-300" 
                          style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {/* Deadline */}
                      <div className="flex items-center gap-1">
                        <FiCalendar className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(task.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Assignee */}
                      {task.userId && typeof task.userId === 'object' && !isAssignedToMe && (
                        <div className="flex items-center gap-1.5">
                          {getAssigneeAvatar()}
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.userId.firstName} {task.userId.lastName}
                          </span>
                        </div>
                      )}

                      {/* Assigned by info */}
                      {!forceAllowEditDelete && task.createdBy && isAssignedToMe && task.createdBy.email !== currentUserEmail && (
                        <div className="flex items-center gap-1">
                          <FiUser className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            by {task.createdBy.firstName} {task.createdBy.lastName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Subtasks Toggle */}
                    {hasSubtasks && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setShowSubtasks(!showSubtasks); }}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                          theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        {showSubtasks ? (
                          <FiChevronDown className="w-3 h-3" />
                        ) : (
                          <FiChevronRight className="w-3 h-3" />
                        )}
                        <span>Subtasks</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Subtasks List */}
            {hasSubtasks && showSubtasks && (
              <div className="mt-2 ml-8 space-y-2">
                {task.subtasks?.map((subtask) => {
                  // Only allow completion if subtask is assigned to me
                  const subtaskAssigneeEmail =
                    typeof subtask.userId === "object" && subtask.userId?.email
                      ? subtask.userId.email.trim().toLowerCase()
                      : typeof subtask.userId === "string"
                        ? subtask.userId.trim().toLowerCase()
                        : "";
                  const isSubtaskMine =
                    subtaskAssigneeEmail === currentUserEmail.trim().toLowerCase();

                  return (
                    <div 
                      key={subtask._id} 
                      className={`relative p-3 rounded-md border transition-all duration-200 hover:shadow-sm ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {/* Connecting Line */}
                      <div className={`absolute -left-8 top-1/2 w-6 h-px ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
                      <div className={`absolute -left-8 top-1/2 w-1.5 h-1.5 rounded-full transform -translate-y-1/2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 flex-1">
                          <button
                            type="button"
                            onClick={() => onToggleComplete && isSubtaskMine && onToggleComplete(subtask)}
                            className={`transition-transform hover:scale-110 ${
                              !isSubtaskMine ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={loading || !isSubtaskMine}
                          >
                            {subtask.completed ? 
                              <FaCheckCircle className="w-4 h-4 text-green-500" /> : 
                              <FaRegCircle className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}`} />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              subtask.completed 
                                ? 'line-through text-gray-500' 
                                : theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>
                              {subtask.title}
                              {/* Show assignee if not me */}
                              {subtask.userId && typeof subtask.userId === 'object' && subtask.userId.email !== currentUserEmail && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  {subtask.userId.firstName} {subtask.userId.lastName}
                                </span>
                              )}
                              {/* If assigned to me, show "Me" badge */}
                              {isSubtaskMine && (
                                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  Me
                                </span>
                              )}
                            </p>
                            {subtask.description && (
                              <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                                {subtask.description.length > 60 
                                  ? `${subtask.description.substring(0, 60)}...`
                                  : subtask.description
                                }
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEdit(subtask)}
                            className={`p-1 rounded transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700 text-gray-500 hover:text-blue-400' 
                                : 'hover:bg-gray-200 text-gray-500 hover:text-blue-600'
                            }`}
                            disabled={loading || !canEditOrDelete}
                            title="Edit subtask"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(subtask._id)}
                            className={`p-1 rounded transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700 text-gray-500 hover:text-red-400' 
                                : 'hover:bg-gray-200 text-gray-500 hover:text-red-600'
                            }`}
                            disabled={loading || !canEditOrDelete}
                            title="Delete subtask"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <TimeTrackingModal
        show={showTimeModal}
        onClose={handleTimeModalClose}
        onSubmit={handleTimeModalSubmit}
        defaultTitle={pendingComplete ? pendingComplete.title : ''}
      />
    </>
  );
});

export default React.memo(TaskCard);

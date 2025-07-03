import React from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaCalendarAlt, FaFlag, FaTimes, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";

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
  status?: string;
  tags?: string[];
  assignees?: Array<{ firstName?: string; lastName?: string; email?: string; avatarUrl?: string }>;
  dueEndDate?: string;
  subtasks?: Task[];
  isSubtask?: boolean;
  parentTask?: string;
  important?: boolean; // Keep this for backward compatibility with existing subtasks
}

interface TaskDetailsModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  onToggleSubtask?: (subtask: Task) => void;
  theme?: string;
  currentUserEmail?: string;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  open, 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onToggleSubtask,
  theme = "light",
  currentUserEmail
}) => {
  const [showSubtasks, setShowSubtasks] = React.useState(false);
  const [localTask, setLocalTask] = React.useState<Task | null>(null);

  // Update local task when task prop changes
  React.useEffect(() => {
    setLocalTask(task);
  }, [task]);

  if (!open || !localTask) return null;

  // Show assignee info if the task is assigned and not assigned to the current user
  const showAssigneeInfo = localTask.userId && typeof localTask.userId === 'object' && localTask.userId.email !== currentUserEmail;

  // Show creator info if the task was not created by the current user
  const showCreatorInfo = localTask.createdBy && localTask.createdBy.email !== currentUserEmail;

  // Use localTask instead of task for all calculations
  const completedSubtasks = localTask.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = localTask.subtasks?.length || 0;
  
  // Check if task can be completed - only if all subtasks are completed or no subtasks exist
  const hasIncompleteSubtasks = totalSubtasks > 0 && completedSubtasks < totalSubtasks;
  const canCompleteTask = !hasIncompleteSubtasks;
  
  // Don't allow any completion changes if task has subtasks
  const hasSubtasks = totalSubtasks > 0;

  // Compute status with proper date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const deadlineDate = new Date(localTask.deadline);
  deadlineDate.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const isOverdue = !localTask.completed && deadlineDate < today; // Only overdue if deadline is BEFORE today
  const isToday = !localTask.completed && deadlineDate.getTime() === today.getTime(); // Due today if dates match exactly
  
  let status = "Pending";
  let statusColor = theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-500/50' : 'bg-blue-50 text-blue-700 border-blue-200';
  
  if (localTask.completed) {
    status = "Completed";
    statusColor = theme === 'dark' ? 'bg-green-900/30 text-green-400 border-green-500/50' : 'bg-green-50 text-green-700 border-green-200';
  } else if (isOverdue) {
    status = "Overdue";
    statusColor = theme === 'dark' ? 'bg-red-900/30 text-red-400 border-red-500/50' : 'bg-red-50 text-red-700 border-red-200';
  } else if (isToday) {
    status = "Due Today";
    statusColor = theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }

  const getAssigneeAvatar = () => {
    if (localTask.userId && typeof localTask.userId === 'object') {
      const firstName = localTask.userId.firstName || '';
      const lastName = localTask.userId.lastName || '';
      const initials = (firstName[0] || '') + (lastName[0] || '');
      return (
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
        }`}>
          {initials || 'U'}
        </div>
      );
    }
    return null;
  };

  const handleSubtaskToggle = async (subtask: Task) => {
    if (onToggleSubtask && localTask) {
      // Optimistically update the local state first
      const updatedSubtasks = localTask.subtasks?.map(s => 
        s._id === subtask._id ? { ...s, completed: !s.completed } : s
      ) || [];
      
      setLocalTask({
        ...localTask,
        subtasks: updatedSubtasks
      });

      try {
        // Then make the API call
        await onToggleSubtask(subtask);
      } catch (error) {
        // If API call fails, revert the optimistic update
        console.error('Failed to toggle subtask:', error);
        setLocalTask(task); // Revert to original task state
      }
    }
  };

  const handleMainTaskToggle = async (task: Task) => {
    if (onToggleComplete) {
      // Optimistically update the local state first
      setLocalTask({
        ...localTask,
        completed: !localTask.completed
      });

      try {
        // Then make the API call
        await onToggleComplete(task);
      } catch (error) {
        // If API call fails, revert the optimistic update
        console.error('Failed to toggle main task:', error);
        setLocalTask(localTask); // Revert to original state
      }
    }
  };

  const getSubtaskStatus = (subtask: Task) => {
    const subtaskDeadline = new Date(subtask.deadline);
    subtaskDeadline.setHours(0, 0, 0, 0);
    
    if (subtask.completed) return 'completed';
    if (subtaskDeadline < today) return 'overdue';
    if (subtaskDeadline.getTime() === today.getTime()) return 'today';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-4 ${
          theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className={`text-lg font-bold mb-2 ${
                localTask.completed 
                  ? 'line-through text-gray-500' 
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {localTask.title}
              </h2>
              
              {/* Status and Priority Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                  {localTask.completed && <FaCheckCircle className="w-2.5 h-2.5" />}
                  {isOverdue && !localTask.completed && <FaCalendarAlt className="w-2.5 h-2.5" />}
                  {isToday && !localTask.completed && <FiClock className="w-2.5 h-2.5" />}
                  {status}
                </span>
                
                {totalSubtasks > 0 && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    theme === 'dark' ? 'bg-purple-900/30 text-purple-400 border-purple-500/50' : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}>
                    {completedSubtasks}/{totalSubtasks} Subtasks
                  </span>
                )}

                {localTask.priority === 'critical' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    theme === 'dark' ? 'bg-red-900/30 text-red-400 border-red-500/50' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    🔥 Critical
                  </span>
                )}
                
                {localTask.priority === 'high' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    theme === 'dark' ? 'bg-orange-900/30 text-orange-400 border-orange-500/50' : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    ⚡ High Priority
                  </span>
                )}

                {localTask.priority === 'medium' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    📝 Medium
                  </span>
                )}

                {localTask.priority === 'low' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    theme === 'dark' ? 'bg-green-900/30 text-green-400 border-green-500/50' : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    💡 Low Priority
                  </span>
                )}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Close modal"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Task Information Compact Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Deadline - Always show */}
            <div className="flex items-center gap-2">
              <FiCalendar className={`w-4 h-4 ${
                isOverdue ? 'text-red-500' : isToday ? 'text-yellow-500' : 'text-blue-500'
              }`} />
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Deadline
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(localTask.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Created Date - Always show */}
            <div className="flex items-center gap-2">
              <FiClock className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-500' : 'text-purple-600'}`} />
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Created
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(localTask.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Assignee - Only show if not assigned to current user */}
            {showAssigneeInfo && (
              <div className="flex items-center gap-2">
                {getAssigneeAvatar() || (
                  <FiUser className={`w-4 h-4 ${theme === 'dark' ? 'text-green-500' : 'text-green-600'}`} />
                )}
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Assigned to
                  </p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {localTask.userId && typeof localTask.userId === 'object' 
                      ? `${localTask.userId.firstName} ${localTask.userId.lastName}`
                      : 'Unassigned'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Created By - Only show if not created by current user */}
            {showCreatorInfo && (
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
                }`}>
                  {(localTask.createdBy?.firstName?.[0] || '') + (localTask.createdBy?.lastName?.[0] || '') || 'U'}
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created by
                  </p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {localTask.createdBy ? `${localTask.createdBy.firstName} ${localTask.createdBy.lastName}` : 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    theme === 'dark' 
                      ? 'text-white hover:text-gray-300' 
                      : 'text-gray-900 hover:text-gray-700'
                  }`}
                >
                  {showSubtasks ? (
                    <FaChevronDown className="w-3 h-3" />
                  ) : (
                    <FaChevronRight className="w-3 h-3" />
                  )}
                  Subtasks Progress
                </button>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500" 
                  style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                />
              </div>

              {/* Subtasks List */}
              {showSubtasks && (
                <div className="mt-3 space-y-2">
                  {localTask.subtasks?.map((subtask) => {
                    const subtaskStatus = getSubtaskStatus(subtask);
                    return (
                      <div
                        key={subtask._id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'bg-gray-600 hover:bg-gray-500' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleSubtaskToggle(subtask)}
                            className="transition-transform hover:scale-110"
                            disabled={!onToggleSubtask}
                          >
                            {subtask.completed ? (
                              <FaCheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <FaRegCircle className={`w-4 h-4 ${
                                subtaskStatus === 'overdue' ? 'text-red-500' :
                                subtaskStatus === 'today' ? 'text-yellow-500' :
                                'text-gray-400'
                              } ${onToggleSubtask ? 'cursor-pointer hover:text-green-500' : 'cursor-default'}`} />
                            )}
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            subtask.completed 
                              ? 'line-through text-gray-500' 
                              : theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {subtask.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${
                              subtaskStatus === 'overdue' ? 'text-red-500' :
                              subtaskStatus === 'today' ? 'text-yellow-500' :
                              subtaskStatus === 'completed' ? 'text-green-500' :
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(subtask.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            {/* Keep the flag for existing subtasks that might have important flag */}
                            {subtask.important && (
                              <FaFlag className="w-2.5 h-2.5 text-orange-500" />
                            )}
                            {/* Also check for priority on subtasks */}
                            {subtask.priority === 'critical' && (
                              <span className="text-xs">🔥</span>
                            )}
                            {subtask.priority === 'high' && (
                              <span className="text-xs">⚡</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {localTask.description && (
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Description
              </h3>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {localTask.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className={`p-4 ${
          theme === 'dark' ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            {/* Complete Toggle */}
            <button
              onClick={() => canCompleteTask && !hasSubtasks && handleMainTaskToggle(localTask)}
              disabled={hasSubtasks}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                hasSubtasks
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
              } ${
                localTask.completed
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : canCompleteTask && !hasSubtasks
                    ? theme === 'dark'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-green-500 text-white hover:bg-green-600'
                    : theme === 'dark'
                      ? 'bg-gray-600 text-gray-400'
                      : 'bg-gray-300 text-gray-500'
              }`}
              title={
                hasSubtasks
                  ? 'Tasks with subtasks cannot be completed manually. Complete all subtasks instead.'
                  : localTask.completed 
                    ? 'Mark as incomplete' 
                    : 'Mark as complete'
              }
            >
              {localTask.completed ? (
                <>
                  <FaRegCircle className="w-3.5 h-3.5" />
                  {hasSubtasks ? 'Managed by subtasks' : 'Incomplete'}
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-3.5 h-3.5" />
                  {hasSubtasks ? 'Managed by subtasks' : 'Complete'}
                </>
              )}
            </button>

            {/* Edit and Delete Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(localTask)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <FaEdit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(localTask._id);
                    onClose();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <FaTrash className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;

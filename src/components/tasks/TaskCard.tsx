import React, { useState } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaExclamationTriangle } from "react-icons/fa";
import TimeTrackingModal from "../time-tracking/TimeTrackingModal";

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
  timeTracking?: { title: string; duration: number; description: string }; // Added property
}

interface TaskCardProps {
  task: Task;
  currentUserEmail: string;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (task: Task) => void; // Made optional
  isTaskOverdue: (task: Task) => boolean;
  forceAllowEditDelete?: boolean;
  onShowDetails?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUserEmail,
  loading,
  onEdit,
  onDelete,
  onToggleComplete,
  isTaskOverdue,
  forceAllowEditDelete,
  onShowDetails,
}) => {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingComplete, setPendingComplete] = useState<null | Task>(null);

  const isOverdue = isTaskOverdue(task);
  const isCompleted = task.completed;
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  const isToday = !isOverdue && deadlineDate.getTime() === now.getTime();
  const showExclamation = !!task.important || isOverdue;

  // Determine if current user is the creator
  const assignerEmail = (task.createdBy?.email || "").trim().toLowerCase();
  const userEmail = (currentUserEmail || "").trim().toLowerCase();
  const canEditOrDelete = assignerEmail === userEmail || forceAllowEditDelete;

  // Card style like dashboard preview
  let cardBgClass =
    isCompleted
      ? "opacity-80 bg-green-50 border-l-8 border-green-400"
      : isOverdue
        ? "bg-red-50 border border-red-500"
        : isToday || !!task.important
          ? "bg-yellow-50 border border-yellow-500"
          : "bg-white border border-gray-200";
  let titleClass =
    isCompleted
      ? "line-through text-gray-600"
      : isOverdue
        ? "text-lg font-extrabold text-red-700 flex items-center gap-2"
        : showExclamation
          ? "text-lg font-extrabold text-gray-900 flex items-center gap-2"
          : "text-gray-900 font-bold";
  let deadlineClass =
    isCompleted
      ? "text-gray-400"
      : isOverdue
        ? "text-red-600 font-bold"
        : isToday
          ? "text-yellow-700 font-bold"
          : "text-gray-700";
  let icon =
    isCompleted
      ? <FaCheckCircle className="text-green-500 text-2xl" />
      : <FaRegCircle className={`transition-transform duration-300 text-2xl${isOverdue ? ' text-red-500' : ''}`} />;
  let exclamation = null;
  if (isOverdue) {
    exclamation = (
      <FaExclamationTriangle className="inline-block mr-1 text-red-500 text-lg align-middle" title="Overdue" />
    );
  } else if (showExclamation) {
    exclamation = (
      <FaExclamationTriangle className="inline-block mr-1 text-orange-500 text-lg align-middle" title="Important" />
    );
  }

  // Determine if assigned to current user
  const taskAssigneeEmail = typeof task.userId === 'object' && task.userId?.email ? task.userId.email.trim().toLowerCase() : '';
  const isAssignedToMe = taskAssigneeEmail === userEmail || (typeof task.userId === 'string' && task.userId === userEmail);
  
  // Only allow completion if the task is assigned by me (I'm the creator) or assigned to me
  const canComplete = isAssignedToMe;

  const handleCompleteClick = (task: Task) => {
    if (!task.completed) {
      setPendingComplete(task);
      setShowTimeModal(true);
      // Do NOT mark as complete yet
    } else if (onToggleComplete) {
      onToggleComplete(task);
    }
  };

  const handleTimeModalSubmit = async (data: { title: string; duration: number; description: string; tag: string }) => {
    setShowTimeModal(false);
    if (pendingComplete) {
      // Save time session to database
      try {
        await fetch('/api/time-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: pendingComplete.userId?._id || pendingComplete.userId, // handle both object and string
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
        onToggleComplete(pendingComplete); // Mark as complete after modal closes
      }
    }
    setPendingComplete(null);
  };

  const handleTimeModalClose = () => {
    setShowTimeModal(false);
    if (pendingComplete && onToggleComplete) {
      onToggleComplete(pendingComplete); // Mark as complete even if modal is cancelled
    }
    setPendingComplete(null);
  };

  return (
    <>
      <button
        type="button"
        className={`relative flex items-start justify-between p-5 rounded-xl shadow-sm group transition-all duration-200 w-full text-left ${cardBgClass}`}
        aria-label={`Task: ${task.title}, Status: ${task.completed ? "Completed" : "Pending"}${isOverdue && !isCompleted ? ", Overdue" : ""}`}
        style={{ opacity: isOverdue ? 0.9 : 1 }}
        onClick={() => onShowDetails && onShowDetails(task)}
      >
        <div className="flex-1 pr-4">
          <span
            className={`block leading-tight font-bold flex items-center gap-2 ${titleClass}`}
            style={{ fontSize: (isOverdue || showExclamation) ? '1.15rem' : undefined }}
          >
            {exclamation}
            {task.title}
          </span>
          {task.description && (
            <p className={`mt-2 line-clamp-2 text-gray-700`}>
              {task.description.split(" ").slice(0, 5).join(" ")}
              {task.description.split(" ").length > 5 ? "..." : ""}
            </p>
          )}
          {/* Show "Assigned to" if the task is assigned to someone else (not me) and assignee info is available */}
          {task.userId &&
            typeof task.userId === "object" &&
            task.userId.email &&
            !isAssignedToMe && (
              <p className="text-xs text-gray-700 mt-2">
                <span className="font-semibold">Assigned to:</span>{" "}
                {task.userId.firstName} {task.userId.lastName} ({task.userId.email})
              </p>
          )}
          <p className={`mt-3 text-xs flex items-center gap-2 ${deadlineClass}`}> 
            Due: {new Date(task.deadline).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {isOverdue && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded font-extrabold tracking-wide shadow-sm border border-red-600">
                OVERDUE
              </span>
            )}
            {isToday && !isOverdue && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-extrabold tracking-wide shadow-sm border border-yellow-600">
                TODAY
              </span>
            )}
          </p>
          {/* Show "Assigned by" only if:
              - NOT in assigned-by-me list (forceAllowEditDelete is false/undefined)
              - The task is assigned to me (task.userId.email === currentUserEmail)
              - The assigner is NOT me (task.createdBy.email !== currentUserEmail)
          */}
          {!forceAllowEditDelete &&
            task.createdBy &&
            typeof task.createdBy === "object" &&
            task.createdBy.email &&
            task.userId &&
            typeof task.userId === "object" &&
            task.userId.email &&
            isAssignedToMe &&
            task.createdBy.email !== currentUserEmail && (
              <p className="text-xs text-gray-700 mt-2">
                <span className="font-semibold">Assigned by:</span>{" "}
                {task.createdBy.firstName} {task.createdBy.lastName} ({task.createdBy.email})
              </p>
          )}
        </div>
        <div className="self-center pl-3 flex flex-col items-end gap-2">
          {onToggleComplete && canComplete && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleCompleteClick(task); }}
              className="flex items-center text-lg font-semibold p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
              aria-label={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
              disabled={loading}
            >
              {icon}
            </button>
          )}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onEdit(task); }}
              className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Edit Task"
              disabled={loading || !canEditOrDelete}
            >
              <FaEdit className="text-xl" />
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onDelete(task._id); }}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Task"
              disabled={loading || !canEditOrDelete}
            >
              <FaTrash className="text-xl" />
            </button>
          </div>
        </div>
      </button>
      <TimeTrackingModal
        show={showTimeModal}
        onClose={handleTimeModalClose}
        onSubmit={handleTimeModalSubmit}
        defaultTitle={pendingComplete ? pendingComplete.title : ''}
      />
    </>
  );
};

export default TaskCard;

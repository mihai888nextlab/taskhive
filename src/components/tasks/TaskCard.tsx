import React from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaExclamationTriangle } from "react-icons/fa";

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

interface TaskCardProps {
  task: Task;
  currentUserEmail: string;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  isTaskOverdue: (task: Task) => boolean;
  forceAllowEditDelete?: boolean;
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
}) => {
  console.log("TaskCard task:", task);

  const isOverdue = isTaskOverdue(task);
  const isCompleted = task.completed;

  let cardBgClass = "bg-white border-l-8 border-primary";
  let titleClass = "text-gray-900";
  let descriptionClass = "text-gray-700";
  let deadlineClass = "text-gray-500";
  let statusIcon = <FaRegCircle className="text-gray-400 text-3xl mr-2 group-hover:text-primary transition-colors" />;
  let statusTooltip = "Mark as Complete";

  if (isCompleted) {
    cardBgClass = "opacity-80 bg-green-50 border-l-8 border-green-400";
    titleClass = "line-through text-gray-600";
    descriptionClass = "line-through text-gray-500";
    deadlineClass = "text-gray-400";
    statusIcon = <FaCheckCircle className="text-green-500 text-3xl mr-2 group-hover:text-green-600 transition-colors" />;
    statusTooltip = "Mark as Incomplete";
  } else if (isOverdue) {
    cardBgClass = "bg-red-50 border-l-8 border-red-400 shadow-lg";
    titleClass = "text-gray-900 font-bold";
    descriptionClass = "text-gray-700";
    deadlineClass = "text-gray-600 font-semibold";
    statusIcon = <FaExclamationTriangle className="text-red-500 text-3xl mr-2" />;
    statusTooltip = "Task is Overdue (Cannot complete directly)";
  }

  const assignerEmail = (task.createdBy?.email || "").trim().toLowerCase();
  const userEmail = (currentUserEmail || "").trim().toLowerCase();
  const canEditOrDelete = forceAllowEditDelete || assignerEmail === userEmail;

  const taskAssigneeEmail = typeof task.userId === 'object' && task.userId?.email ? task.userId.email.trim().toLowerCase() : '';

  const isCreator = assignerEmail === userEmail;

  // Logic for showing "Assigned by"
  // We want to show "Assigned by" ONLY if:
  // 1. We are NOT in the "assigned by me" view (i.e., forceAllowEditDelete is false or undefined)
  // 2. The task is assigned TO the current user
  // 3. The current user is NOT the creator/assigner of the task
  const showAssignedBy =
    !forceAllowEditDelete && // This ensures we are not in the 'assigned by me' list
    task.createdBy &&
    typeof task.createdBy === "object" &&
    task.createdBy.email &&
    taskAssigneeEmail === userEmail && // The task is assigned to the current user
    assignerEmail !== userEmail; // The current user is NOT the one who created it

  return (
    <div
      className={`group flex flex-col justify-between p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-gray-100 ${cardBgClass}`}
      aria-label={`Task: ${task.title}, Status: ${task.completed ? "Completed" : "Pending"}${isOverdue && !isCompleted ? ", Overdue" : ""}`}
    >
      <div className="flex-1">
        <h3 className={`text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-3 break-words ${titleClass}`}>
          {task.title}
          {task.important && (
            <FaExclamationTriangle className="inline ml-2 text-yellow-500" title="Important" />
          )}
        </h3>
        {task.description && (
          <p className={`text-base sm:text-lg md:text-xl mb-4 line-clamp-3 ${descriptionClass}`}>
            {task.description}
          </p>
        )}
        <p className={`text-sm font-semibold ${deadlineClass}`}>
          Deadline: {new Date(task.deadline).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          {isOverdue && !isCompleted && (
            <span className="ml-2 px-2.5 py-1 bg-red-400 text-white text-xs rounded-full font-bold">
              OVERDUE
            </span>
          )}
        </p>
        {/* Show "Assigned to" only if in assigned-by-me list */}
        {forceAllowEditDelete &&
          task.userId &&
          typeof task.userId === "object" &&
          task.userId.email && (
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-semibold">Assigned to:</span>{" "}
              {task.userId.firstName} {task.userId.lastName} ({task.userId.email})
            </p>
        )}
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
          task.userId.email === currentUserEmail &&
          task.createdBy.email !== currentUserEmail && (
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-semibold">Assigned by:</span>{" "}
              {task.createdBy.firstName} {task.createdBy.lastName} ({task.createdBy.email})
            </p>
        )}
      </div>
      <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
        <button
          onClick={() => onToggleComplete(task)}
          className={`flex items-center text-lg font-semibold p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group
            ${isOverdue && !isCompleted ? "text-red-700 focus:ring-red-500" : "text-gray-700 focus:ring-primary"}`}
          title={statusTooltip}
          aria-label={statusTooltip}
          disabled={loading || (isOverdue && !isCompleted)}
        >
          {statusIcon}
          <span className="hidden sm:inline">
            {isOverdue && !isCompleted ? "Overdue" : task.completed ? "Completed" : "Mark Complete"}
          </span>
        </button>
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(task)}
            className="text-primary hover:text-primary-dark p-3 rounded-full hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Edit Task"
            disabled={loading || task.completed || isOverdue || !canEditOrDelete}
          >
            <FaEdit className="text-2xl" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-red-500 hover:text-red-700 p-3 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Task"
            disabled={loading || !canEditOrDelete}
          >
            <FaTrash className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

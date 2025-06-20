import React from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaExclamationTriangle } from "react-icons/fa";

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
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
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUserEmail,
  loading,
  onEdit,
  onDelete,
  onToggleComplete,
  isTaskOverdue,
}) => {
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

  const assignerEmail = task.createdBy?.email?.trim().toLowerCase() || "";
  const userEmail = currentUserEmail.trim().toLowerCase();
  const canEditOrDelete = assignerEmail === userEmail;

  return (
    <div
      className={`group flex flex-col justify-between p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-gray-100 ${cardBgClass}`}
      aria-label={`Task: ${task.title}, Status: ${task.completed ? "Completed" : "Pending"}${isOverdue && !isCompleted ? ", Overdue" : ""}`}
    >
      <div className="flex-1">
        <h3 className={`text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-3 break-words ${titleClass}`}>
          {task.title}
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
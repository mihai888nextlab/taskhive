import React from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaRegCircle } from "react-icons/fa";

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
  status?: string;
  priority?: string;
  tags?: string[];
  assignees?: Array<{ firstName?: string; lastName?: string; email?: string; avatarUrl?: string }>;
  dueEndDate?: string;
}

interface TaskDetailsModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

const statusColors: Record<string, string> = {
  "Completed": "bg-green-100 text-green-800 border-green-300",
  "Pending": "bg-blue-100 text-blue-800 border-blue-300",
  "Overdue": "bg-red-100 text-red-800 border-red-300",
};
const priorityColors: Record<string, string> = {
  "Low": "bg-blue-50 text-blue-600 border-blue-100",
  "Medium": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "High": "bg-red-50 text-red-700 border-red-100",
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ open, task, onClose, onEdit, onDelete, onToggleComplete }) => {
  if (!open || !task) return null;
  // Compute status: Completed, Overdue, or Pending
  let status = "Pending";
  if (task.completed) {
    status = "Completed";
  } else if (new Date(task.deadline) < new Date()) {
    status = "Overdue";
  }
  const priority = task.priority || (task.important ? "Important" : "Not Important");
  const tags = task.tags || ["Task"];
  const dueEndDate = task.dueEndDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-xl w-full relative overflow-hidden lg:max-w-2xl">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        {/* Title and actions */}
        <div className="flex justify-between items-start px-8 pt-8 pb-2">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{status}</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityColors[priority] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{priority}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              className="flex items-center text-lg font-semibold p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group border border-gray-200 shadow-sm"
              title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
              aria-label={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
            >
              {task.completed ? (
                <FaCheckCircle className="text-green-500 text-2xl" />
              ) : (
                <FaRegCircle className="text-2xl" />
              )}
            </button>
            <button
              className="bg-primary text-white px-3 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
              onClick={() => onEdit(task)}
            >
              <FaEdit className="inline mr-1" /> Edit
            </button>
            <button
              className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              onClick={() => onDelete(task._id)}
            >
              <FaTrash className="inline mr-1" /> Delete
            </button>
          </div>
        </div>
        {/* Info grid */}
        <div className="px-8 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Created:</span> {new Date(task.createdAt).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Due:</span> {dueEndDate ? `${new Date(task.deadline).toLocaleDateString()} - ${new Date(dueEndDate).toLocaleDateString()}` : new Date(task.deadline).toLocaleDateString()}
            </div>
          </div>
        </div>
        {/* Description */}
        <div className="px-8 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm">
            <span className="font-semibold block mb-1">Project Description</span>
            {task.description || <span className="italic text-gray-400">No description</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;

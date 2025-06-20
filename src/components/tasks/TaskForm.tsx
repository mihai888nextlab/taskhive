import React from "react";
import { FaSpinner } from "react-icons/fa";

interface TaskFormProps {
  show: boolean;
  loading: boolean;
  editingTaskId: string | null;
  taskTitle: string;
  taskDescription: string;
  taskDeadline: string;
  assignedTo: string;
  usersBelowMe: any[];
  formError: string | null;
  theme: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onDeadlineChange: (v: string) => void;
  onAssignedToChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  show,
  loading,
  editingTaskId,
  taskTitle,
  taskDescription,
  taskDeadline,
  assignedTo,
  usersBelowMe,
  formError,
  theme,
  onTitleChange,
  onDescriptionChange,
  onDeadlineChange,
  onAssignedToChange,
  onSubmit,
  onCancel,
}) => {
  if (!show) return null;
  return (
    <div id="task-form" className="transition-all duration-500 ease-in-out py-6">
      <form
        onSubmit={onSubmit}
        className={`bg-${theme === 'light' ? 'gray-50' : 'gray-800'} p-8 rounded-2xl shadow-xl border border-gray-200 animate-fadeIn`}
      >
        <h2 className={`text-3xl font-bold text-${theme === 'light' ? 'gray-800' : 'white'} mb-6 text-center`}>
          {editingTaskId ? "Edit Task Details" : "Create New Task"}
        </h2>
        {formError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm" role="alert">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">Validation Error</p>
                <p className="text-sm">{formError}</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="taskTitle" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500`}>
              Title:
            </label>
            <input
              type="text"
              id="taskTitle"
              className={`w-full py-3 px-4 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base`}
              placeholder="e.g., Prepare presentation for Q3 review"
              value={taskTitle}
              onChange={e => onTitleChange(e.target.value)}
              required
              disabled={loading}
              aria-label="Task title"
            />
          </div>
          <div>
            <label htmlFor="taskDeadline" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500`}>
              Deadline:
            </label>
            <input
              type="date"
              id="taskDeadline"
              className={`w-full py-3 px-4 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base`}
              value={taskDeadline}
              onChange={e => onDeadlineChange(e.target.value)}
              required
              disabled={loading}
              aria-label="Task deadline date"
            />
          </div>
        </div>
        <div className="mb-8">
          <label htmlFor="taskDescription" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-2`}>
            Description (Optional):
          </label>
          <textarea
            id="taskDescription"
            rows={4}
            className={`w-full py-3 px-4 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200 placeholder-gray-400 text-base`}
            placeholder="Add more details or sub-tasks here..."
            value={taskDescription}
            onChange={e => onDescriptionChange(e.target.value)}
            disabled={loading}
            aria-label="Task description"
          ></textarea>
        </div>
        <div className="mb-8">
          <label htmlFor="assignedTo" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-2`}>
            Assign To:
          </label>
          <select
            id="assignedTo"
            className={`w-full py-3 px-4 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base`}
            value={assignedTo}
            onChange={e => onAssignedToChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Myself</option>
            {usersBelowMe.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.user?.firstName} {u.user?.lastName} ({u.user?.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-lg"
            disabled={loading}
          >
            {loading && <FaSpinner className="animate-spin mr-3 text-xl" />}
            {editingTaskId ? "Update Task" : "Add Task"}
          </button>
          {editingTaskId && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-lg"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
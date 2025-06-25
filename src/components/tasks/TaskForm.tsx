import React, { useState, useEffect, useRef } from "react";
import { FaSpinner, FaMagic } from "react-icons/fa";

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
  important: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onDeadlineChange: (v: string) => void;
  onAssignedToChange: (v: string) => void;
  onImportantChange: (v: boolean) => void;
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
  important,
  onTitleChange,
  onDescriptionChange,
  onDeadlineChange,
  onAssignedToChange,
  onImportantChange,
  onSubmit,
  onCancel,
}) => {
  // Keep local state in sync with prop for controlled checkbox
  const [localImportant, setLocalImportant] = useState(important);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [descriptionManuallyEdited, setDescriptionManuallyEdited] = useState(false);
  const prevTitleRef = useRef(taskTitle);

  useEffect(() => {
    setLocalImportant(important);
  }, [important]);

  const handleImportantChange = (checked: boolean) => {
    setLocalImportant(checked);
    onImportantChange(checked);
  };

  const handleGenerateDescription = async () => {
    if (!taskTitle) return;
    setGeneratingDescription(true);
    try {
      const prompt = `
You are an expert project manager. Write a single, clear, and concise task description for the following task title: "${taskTitle}".

- The description should be 1-3 sentences.
- Do not provide multiple options, explanations, or recommendations.
- Do not include headings, labels, or formatting—just the plain description.
- Focus on what needs to be done, the goal, and any relevant context.
- Do not mention that you are an AI or assistant.
- Output only the description, nothing else.
`;
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.response) {
        onDescriptionChange(data.response);
      }
    } finally {
      setGeneratingDescription(false);
    }
  };

  useEffect(() => {
    if (taskDescription === "") {
      setDescriptionManuallyEdited(false);
    }
  }, [taskDescription]);

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
          <div className="flex items-center">
            <textarea
              id="taskDescription"
              rows={4}
              className={`flex-1 py-3 px-4 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200 placeholder-gray-400 text-base`}
              placeholder="Add more details or sub-tasks here..."
              value={taskDescription}
              onChange={e => onDescriptionChange(e.target.value)}
              disabled={loading || generatingDescription}
              aria-label="Task description"
            />
            <button
              type="button"
              className="ml-2 px-3 py-2 bg-primary text-white rounded-lg flex items-center font-semibold shadow hover:bg-primary-dark transition disabled:opacity-60"
              onClick={handleGenerateDescription}
              disabled={!taskTitle || generatingDescription}
              title="Generate description from title"
            >
              {generatingDescription ? <FaSpinner className="animate-spin" /> : <FaMagic className="mr-1" />}
              Generate
            </button>
          </div>
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
        <div className="mb-8 flex items-center">
          <input
            id="important"
            type="checkbox"
            checked={localImportant}
            onChange={e => handleImportantChange(e.target.checked)}
            className="mr-2"
            disabled={loading}
          />
          <label htmlFor="important" className={`text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold`}>
            Mark as Important
          </label>
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
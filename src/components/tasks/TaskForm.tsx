import React, { useState, useEffect, useRef } from "react";
import { FaSpinner, FaMagic, FaPlus, FaTrash, FaRobot } from "react-icons/fa";

interface Subtask {
  title: string;
  description: string;
}

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
  onSubmit: (e: React.FormEvent, subtasks?: Subtask[]) => void;
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

  // Subtasks state
  const [includeSubtasks, setIncludeSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);

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
      const existingDescription = taskDescription.trim();
      let prompt = `
You are an expert project manager. Write a single, clear, and concise task description for the following task title: "${taskTitle}".`;

      if (existingDescription) {
        prompt += `

The task already has some description content: "${existingDescription}"

Please enhance and expand this existing description while keeping the original intent and adding more clarity and detail.`;
      }

      prompt += `

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

  const handleGenerateSubtasks = async () => {
    if (!taskTitle) return;
    setGeneratingSubtasks(true);
    try {
      const res = await fetch("/api/tasks/generate-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: taskTitle, 
          description: taskDescription 
        }),
      });
      const data = await res.json();
      if (data.subtasks && Array.isArray(data.subtasks)) {
        setSubtasks(data.subtasks);
      }
    } catch (error) {
      console.error("Error generating subtasks:", error);
    } finally {
      setGeneratingSubtasks(false);
    }
  };

  const addManualSubtask = () => {
    setSubtasks([...subtasks, { title: "", description: "" }]);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...subtasks];
    updated[index][field] = value;
    setSubtasks(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validSubtasks = includeSubtasks ? subtasks.filter(s => s.title.trim()) : [];
    onSubmit(e, validSubtasks);
  };

  useEffect(() => {
    if (taskDescription === "") {
      setDescriptionManuallyEdited(false);
    }
  }, [taskDescription]);

  // Reset subtasks when form is closed or task changes
  useEffect(() => {
    if (!show) {
      setIncludeSubtasks(false);
      setSubtasks([]);
    }
  }, [show]);

  if (!show) return null;
  
  return (
    <div id="task-form" className="transition-all duration-500 ease-in-out">
      <form
        onSubmit={handleSubmit}
        className={`bg-${theme === 'light' ? 'gray-50' : 'gray-800'} p-4 sm:p-8 rounded-2xl animate-fadeIn max-h-[90vh] overflow-y-auto`}
      >
        <h2 className={`text-2xl sm:text-3xl font-bold text-${theme === 'light' ? 'gray-800' : 'white'} mb-4 sm:mb-6 text-center`}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
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
            {editingTaskId && (
              <p className="text-xs text-blue-600 mt-1">
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Updating this deadline will also update all subtask deadlines
              </p>
            )}
          </div>
        </div>
        <div className="mb-6 sm:mb-8">
          <label htmlFor="taskDescription" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-2`}>
            Description (Optional):
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              className="sm:ml-2 px-3 py-2 bg-primary text-white rounded-lg flex items-center font-semibold shadow hover:bg-primary-dark transition disabled:opacity-60 mt-2 sm:mt-0"
              onClick={handleGenerateDescription}
              disabled={!taskTitle || generatingDescription}
              title="Generate description from title"
            >
              {generatingDescription ? <FaSpinner className="animate-spin" /> : <FaMagic className="mr-1" />}
              Generate
            </button>
          </div>
        </div>
        <div className="mb-6 sm:mb-8">
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
        <div className="mb-6 sm:mb-8 flex items-center">
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

        {/* Subtasks Section - Only show for new tasks */}
        {!editingTaskId ? (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-4">
              <input
                id="includeSubtasks"
                type="checkbox"
                checked={includeSubtasks}
                onChange={e => setIncludeSubtasks(e.target.checked)}
                className="mr-2"
                disabled={loading}
              />
              <label htmlFor="includeSubtasks" className={`text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold`}>
                Break down into subtasks
              </label>
            </div>

            {includeSubtasks && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Subtasks</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center text-sm font-semibold shadow hover:bg-blue-600 transition disabled:opacity-60"
                      onClick={handleGenerateSubtasks}
                      disabled={!taskTitle || generatingSubtasks}
                      title="Generate subtasks with AI"
                    >
                      {generatingSubtasks ? <FaSpinner className="animate-spin mr-1" /> : <FaRobot className="mr-1" />}
                      AI Generate
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-500 text-white rounded-lg flex items-center text-sm font-semibold shadow hover:bg-green-600 transition"
                      onClick={addManualSubtask}
                    >
                      <FaPlus className="mr-1" />
                      Add Manual
                    </button>
                  </div>
                </div>

                {subtasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No subtasks added yet. Generate with AI or add manually.</p>
                ) : (
                  <div className="space-y-3">
                    {subtasks.map((subtask, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-white rounded-lg border">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Subtask title"
                            value={subtask.title}
                            onChange={e => updateSubtask(index, 'title', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading}
                          />
                          <textarea
                            placeholder="Subtask description (optional)"
                            value={subtask.description}
                            onChange={e => updateSubtask(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            disabled={loading}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                          title="Remove subtask"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Show info about subtasks during edit
          <div className="mb-6 sm:mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                Editing Task with Subtasks
              </span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1 ml-6">
              <li>• Subtasks are preserved and can be edited individually from the task list</li>
              <li>• Changing the deadline will automatically update all subtask deadlines</li>
              <li>• Title and description changes only affect this main task</li>
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pb-2">
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
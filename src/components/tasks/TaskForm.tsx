import React, { useState, useEffect, useRef } from "react";
import { FaSpinner, FaMagic, FaTimes, FaTasks, FaExclamationTriangle, FaBolt, FaFileAlt, FaLightbulb, FaList } from "react-icons/fa";
import SubtasksModal from "./SubtasksModal";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

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
  priority: 'critical' | 'high' | 'medium' | 'low';
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onDeadlineChange: (v: string) => void;
  onAssignedToChange: (v: string) => void;
  onPriorityChange: (v: 'critical' | 'high' | 'medium' | 'low') => void;
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
  priority,
  onTitleChange,
  onDescriptionChange,
  onDeadlineChange,
  onAssignedToChange,
  onPriorityChange,
  onSubmit,
  onCancel,
}) => {
  const [localPriority, setLocalPriority] = useState<'critical' | 'high' | 'medium' | 'low'>(priority);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);
  const [includeSubtasks, setIncludeSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [showSubtasksModal, setShowSubtasksModal] = useState(false);

  useEffect(() => {
    setLocalPriority(priority);
  }, [priority]);

  const handlePriorityChange = (newPriority: 'critical' | 'high' | 'medium' | 'low') => {
    setLocalPriority(newPriority);
    onPriorityChange(newPriority);
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'critical': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'high': return <FaBolt className="w-4 h-4" />;
      case 'medium': return <FaFileAlt className="w-4 h-4" />;
      case 'low': return <FaLightbulb className="w-4 h-4" />;
      default: return <FaFileAlt className="w-4 h-4" />;
    }
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

  const handleSaveSubtasks = (newSubtasks: Subtask[]) => {
    setSubtasks(newSubtasks);
    setIncludeSubtasks(newSubtasks.length > 0);
    setShowSubtasksModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validSubtasks = includeSubtasks ? subtasks.filter(s => s.title.trim()) : [];
    onSubmit(e, validSubtasks);
  };

  useEffect(() => {
    if (!show) {
      setIncludeSubtasks(false);
      setSubtasks([]);
      setShowSubtasksModal(false);
    }
  }, [show]);

  // Convert string date to Date object for DatePicker
  const deadlineDateObj = taskDeadline ? new Date(taskDeadline) : undefined;

  if (!show) return null;
  
  return (
    <>
      <div className="flex h-full">
        <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
            onClick={onCancel}
            aria-label="Close modal"
          >
          <FaTimes />
        </button>

        {/* Left Panel - Form Details */}
        <div className="w-2/5 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
                <FaTasks className="text-xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTaskId ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="text-gray-600">
                  {editingTaskId ? "Update task details" : "Add a new task to your workflow"}
                </p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Error Message */}
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">{formError}</p>
              </div>
            )}

            {/* Basic Task Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-900 text-lg font-semibold mb-3">
                  Task Title *
                </label>
                <Input
                  type="text"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Enter task title..."
                  value={taskTitle}
                  onChange={e => onTitleChange(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-900 text-lg font-semibold mb-3">
                  Deadline *
                </label>
                <DatePicker
                  value={deadlineDateObj}
                  onChange={date => {
                    if (date) {
                      const formatted = date.toISOString().split("T")[0];
                      onDeadlineChange(formatted);
                    }
                  }}
                  disabled={loading}
                  className="w-full"
                  placeholder="mm / dd / yyyy"
                />
              </div>

              <div>
                <label className="block text-gray-900 text-lg font-semibold mb-3">
                  Assign To
                </label>
                <select
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  value={assignedTo}
                  onChange={e => onAssignedToChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Assign to myself</option>
                  {usersBelowMe.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.user?.firstName} {u.user?.lastName} ({u.user?.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 text-lg font-semibold mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['critical', 'high', 'medium', 'low'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handlePriorityChange(level as 'critical' | 'high' | 'medium' | 'low')}
                      className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                        localPriority === level
                          ? getPriorityColor(level) + ' border-current shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      <div className="flex items-center gap-3">
                        {getPriorityIcon(level)}
                        <div>
                          <div className="font-semibold capitalize">{level}</div>
                          <div className="text-xs opacity-75">
                            {level === 'critical' && 'Urgent'}
                            {level === 'high' && 'Important'}
                            {level === 'medium' && 'Normal'}
                            {level === 'low' && 'Nice to have'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Description + Subtasks */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Description Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <label className="block text-gray-900 text-lg font-semibold">
                Task Description
              </label>
              <Button
                type="button"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center font-semibold shadow-sm hover:bg-purple-600 transition disabled:opacity-60"
                onClick={handleGenerateDescription}
                disabled={!taskTitle || generatingDescription}
                title="Generate description from title"
              >
                {generatingDescription ? <FaSpinner className="animate-spin mr-2" /> : <FaMagic className="mr-2" />}
                AI Generate
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Provide detailed information about the task (optional)
            </p>
          </div>

          {/* Description Content + Subtasks */}
          <div className="flex-1 p-6 flex flex-col">
            <textarea
              rows={6}
              className="w-full h-auto min-h-[144px] max-h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-lg"
              placeholder="Describe the task in detail. What needs to be accomplished? What are the key requirements? Any specific instructions or context..."
              value={taskDescription}
              onChange={e => onDescriptionChange(e.target.value)}
              disabled={loading || generatingDescription}
            />

            {/* Subtasks Section - Only for new tasks */}
            {!editingTaskId && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-gray-900 text-lg font-semibold">
                    Subtasks
                  </label>
                  <Button
                    type="button"
                    onClick={() => setShowSubtasksModal(true)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center text-sm font-medium shadow-sm hover:bg-indigo-600 transition-all duration-200"
                    disabled={loading || !taskTitle.trim()}
                  >
                    <FaList className="mr-2 w-4 h-4" />
                    {subtasks.length > 0 ? `Manage (${subtasks.length})` : 'Break Down Task'}
                  </Button>
                </div>

                {subtasks.length > 0 && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FaTasks className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {subtasks.length} subtask{subtasks.length > 1 ? 's' : ''} ready
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {/* ↑ max-h-48 (192px) instead of 32 (128px) */}
                      {subtasks.map((subtask, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                          <div className="font-medium">{subtask.title}</div>
                          {subtask.description && (
                            <div className="text-xs text-gray-500 mt-1">{subtask.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Mode Info */}
          {editingTaskId && (
            <div className="p-6 border-t border-gray-200 bg-blue-50">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Editing Task with Subtasks</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1 ml-6">
                <li>• Subtasks are preserved and can be edited individually</li>
                <li>• Deadline changes will update all subtask deadlines</li>
                <li>• Description changes only affect this main task</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Subtasks Modal */}
      <SubtasksModal
        show={showSubtasksModal}
        taskTitle={taskTitle}
        taskDescription={taskDescription}
        initialSubtasks={subtasks}
        onSave={handleSaveSubtasks}
        onCancel={() => setShowSubtasksModal(false)}
      />

      {/* Footer - full width */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200"
            disabled={loading}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !taskTitle.trim() || !taskDeadline.trim()}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              loading || !taskTitle.trim() || !taskDeadline.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            } flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                {editingTaskId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <FaTasks />
                {editingTaskId ? "Update Task" : "Create Task"}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default TaskForm;
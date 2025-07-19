import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FaSpinner, FaMagic, FaTimes, FaTasks, FaExclamationTriangle, FaBolt, FaFileAlt, FaLightbulb, FaList } from "react-icons/fa";
import SubtasksModal from "./SubtasksModal";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("TasksPage");
  const [localPriority, setLocalPriority] = useState<'critical' | 'high' | 'medium' | 'low'>(priority);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);
  const [includeSubtasks, setIncludeSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [showSubtasksModal, setShowSubtasksModal] = useState(false);

  useEffect(() => {
    setLocalPriority(priority);
  }, [priority]);

  // Memoize priority change handler
  const handlePriorityChange = useCallback((newPriority: 'critical' | 'high' | 'medium' | 'low') => {
    setLocalPriority(newPriority);
    onPriorityChange(newPriority);
  }, [onPriorityChange]);

  // Priority color classes for light/dark
  const getPriorityColor = (priorityLevel: string) => {
    if (theme === 'dark') {
      switch (priorityLevel) {
        case 'critical': return 'bg-red-900 text-red-200 border-red-700';
        case 'high': return 'bg-orange-900 text-orange-200 border-orange-700';
        case 'medium': return 'bg-blue-900 text-blue-200 border-blue-700';
        case 'low': return 'bg-gray-800 text-gray-300 border-gray-700';
        default: return 'bg-gray-800 text-gray-300 border-gray-700';
      }
    } else {
      switch (priorityLevel) {
        case 'critical': return 'bg-red-50 text-red-700 border-red-200';
        case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'low': return 'bg-gray-50 text-gray-700 border-gray-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
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

  // Memoize generate description handler
  const handleGenerateDescription = useCallback(async () => {
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
  }, [taskTitle, taskDescription, onDescriptionChange]);

  // Memoize generate subtasks handler
  const handleGenerateSubtasks = useCallback(async () => {
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
  }, [taskTitle, taskDescription]);

  // Memoize add/remove/update subtask handlers
  const addManualSubtask = useCallback(() => {
    setSubtasks([...subtasks, { title: "", description: "" }]);
  }, [subtasks]);

  const removeSubtask = useCallback((index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  }, [subtasks]);

  const updateSubtask = useCallback((index: number, field: 'title' | 'description', value: string) => {
    const updated = [...subtasks];
    updated[index][field] = value;
    setSubtasks(updated);
  }, [subtasks]);

  const handleSaveSubtasks = useCallback((newSubtasks: Subtask[]) => {
    setSubtasks(newSubtasks);
    setIncludeSubtasks(newSubtasks.length > 0);
    setShowSubtasksModal(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const validSubtasks = includeSubtasks ? subtasks.filter(s => s.title.trim()) : [];
    onSubmit(e, validSubtasks);
  }, [includeSubtasks, subtasks, onSubmit]);

  // Memoize deadlineDateObj
  const deadlineDateObj = useMemo(() => taskDeadline ? new Date(taskDeadline) : undefined, [taskDeadline]);

  useEffect(() => {
    if (!show) {
      setIncludeSubtasks(false);
      setSubtasks([]);
      setShowSubtasksModal(false);
    }
  }, [show]);

  // Convert string date to Date object for DatePicker
  if (!show) return null;

  return (
    <>
      <div className={`flex flex-col md:flex-row h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50 md:bg-transparent'}`}>
        <button
          className={`absolute top-4 right-4 text-xl font-bold z-10 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          onClick={onCancel}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        {/* Left Panel - Form Details */}
        <div className={`w-full md:w-2/5 border-b md:border-b-0 md:border-r flex flex-col rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none shadow-none md:shadow-lg ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          {/* Header */}
          <div className={`p-6 border-b flex items-center gap-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-blue-50'}`}>
            <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
              <FaTasks className="text-xl text-white" />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold truncate select-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  data-testid="task-form-title">
                {editingTaskId ? t('editTask', { default: 'Edit Task' }) : t('createTask', { default: 'Create Task' })}
              </h2>
            </div>
          </div>

          {/* Task Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Error Message */}
            {formError && (
              <div className={`mb-4 p-3 rounded-lg border text-sm font-medium ${theme === 'dark' ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>{formError}</div>
            )}
            <div className="space-y-6">
              {/* Task Title */}
              <div>
                <label className={`block text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("taskTitle")} *</label>
                <Input
                  type="text"
                  className={`w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'border border-gray-300'}`}
                  placeholder={t("enterTaskTitle")}
                  value={taskTitle}
                  onChange={e => onTitleChange(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {/* Deadline */}
              <div>
                <label className={`block text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("deadline")} *</label>
                <DatePicker
                  value={deadlineDateObj}
                  onChange={date => {
                    if (date) {
                      const formatted = date.toISOString().split("T")[0];
                      onDeadlineChange(formatted);
                    } else {
                      onDeadlineChange("");
                    }
                  }}
                  disabled={loading}
                  className="w-full"
                  placeholder="mm / dd / yyyy"
                />
              </div>
              {/* Assign To */}
              <div>
                <label className={`block text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("assignTo")}</label>
                <select
                  className={`w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white' : 'border border-gray-300'}`}
                  value={assignedTo}
                  onChange={e => onAssignedToChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">{t("assignToMyself")}</option>
                  {usersBelowMe.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.user?.firstName} {u.user?.lastName} ({u.user?.email})
                    </option>
                  ))}
                </select>
              </div>
              {/* Priority */}
              <div>
                <label className={`block text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("priorityLevel")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {['critical', 'high', 'medium', 'low'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handlePriorityChange(level as 'critical' | 'high' | 'medium' | 'low')}
                      className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                        localPriority === level
                          ? getPriorityColor(level) + ' border-current shadow-sm'
                          : theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      <div className="flex items-center gap-3">
                        {getPriorityIcon(level)}
                        <div>
                          <div className="font-semibold capitalize">{t(level)}</div>
                          <div className="text-xs opacity-75">
                            {level === 'critical' && t("priorityCriticalSubtitle")}
                            {level === 'high' && t("priorityHighSubtitle")}
                            {level === 'medium' && t("priorityMediumSubtitle")}
                            {level === 'low' && t("priorityLowSubtitle")}
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
        <div className={`flex-1 flex flex-col rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none shadow-none md:shadow-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          {/* Description Header */}
          <div className={`p-6 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200'}`}>
            <label className={`block text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("taskDescription")}</label>
            <Button
              type="button"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center font-semibold shadow-sm hover:bg-purple-600 transition disabled:opacity-60"
              onClick={handleGenerateDescription}
              disabled={!taskTitle || generatingDescription}
              title={t("generateDescriptionFromTitle")}
            >
              {generatingDescription ? <FaSpinner className="animate-spin mr-2" /> : <FaMagic className="mr-2" />}
              {t("aiGenerate")}
            </Button>
          </div>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t("provideDetailedInformationAboutTheTask")}</p>
          {/* Description Content + Subtasks */}
          <div className="flex-1 p-6 flex flex-col">
            <textarea
              rows={6}
              className={`w-full h-auto min-h-[144px] max-h-64 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'border border-gray-300'}`}
              placeholder={t("describeTheTaskInDetail")}
              value={taskDescription}
              onChange={e => onDescriptionChange(e.target.value)}
              disabled={loading || generatingDescription}
            />
            {/* Subtasks Section - Only for new tasks */}
            {!editingTaskId && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <label className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("subtasks")}</label>
                  <Button
                    type="button"
                    onClick={() => setShowSubtasksModal(true)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center text-sm font-medium shadow-sm hover:bg-indigo-600 transition-all duration-200"
                    disabled={loading || !taskTitle.trim()}
                  >
                    <FaList className="mr-2 w-4 h-4" />
                    {subtasks.length > 0 ? `${t("manage")} (${subtasks.length})` : t("breakDownTask")}
                  </Button>
                </div>
                {subtasks.length > 0 && (
                  <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <FaTasks className="w-4 h-4 text-indigo-600" />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        {subtasks.length} subtask{subtasks.length > 1 ? 's' : ''} {t("ready")}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {subtasks.map((subtask, index) => (
                        <div key={index} className={`text-sm rounded border p-2 ${theme === 'dark' ? 'text-gray-300 bg-gray-900 border-gray-700' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                          <div className="font-medium">{subtask.title}</div>
                          {subtask.description && (
                            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{subtask.description}</div>
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
            <div className={`p-6 border-t ${theme === 'dark' ? 'bg-blue-950 border-blue-900 text-blue-200' : 'border-gray-200 bg-blue-50'}`}>
              <div className={`flex items-center gap-2 mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{t("editingTaskWithSubtasks")}</span>
              </div>
              <ul className={`text-xs space-y-1 ml-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• {t("subtasksPreservedAndCanBeEdited")}</li>
                <li>• {t("deadlineChangesUpdateAllSubtaskDeadlines")}</li>
                <li>• {t("descriptionChangesAffectMainTaskOnly")}</li>
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
        usersBelowMe={usersBelowMe}
        currentUserId={typeof window !== "undefined" ? window?.__NEXT_DATA__?.props?.pageProps?.currentUserId || "" : ""}
        onSave={handleSaveSubtasks}
        onCancel={() => setShowSubtasksModal(false)}
      />
      {/* Footer - full width */}
      <div className={`p-6 border-t rounded-b-3xl ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onCancel}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            disabled={loading}
            variant="ghost"
          >
            {t('cancel', { default: 'Cancel' })}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !taskTitle.trim() || !taskDeadline.trim()}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !taskTitle.trim() || !taskDeadline.trim()
                ? theme === 'dark'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm hover:shadow-md'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            }`}
          >
            {loading ? <FaSpinner className="animate-spin w-4 h-4" /> : null}
            {editingTaskId ? t('save', { default: 'Save' }) : t('createTask', { default: 'Create Task' })}
          </Button>
        </div>
      </div>
    </>
  );
};

export default TaskForm;
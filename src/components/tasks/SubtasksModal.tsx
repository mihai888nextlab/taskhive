import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSpinner, FaRobot, FaPlus, FaTrash, FaTimes, FaTasks, FaBolt, FaUser } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeContext";

interface Subtask {
  title: string;
  description: string;
  assignedTo?: string; // Add assignedTo field
}

interface UserType {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  skills?: string[];
}

interface SubtasksModalProps {
  show: boolean;
  taskTitle: string;
  taskDescription: string;
  initialSubtasks: Subtask[];
  onSave: (subtasks: Subtask[]) => void;
  onCancel: () => void;
  usersBelowMe: { userId: string; user?: UserType }[];
  currentUserId?: string; // <-- Add this prop for filtering
}

const SubtasksModal: React.FC<SubtasksModalProps> = ({
  show,
  taskTitle,
  taskDescription,
  initialSubtasks,
  onSave,
  onCancel,
  usersBelowMe,
  currentUserId, // <-- Add this prop
}) => {
  const t = useTranslations("TasksPage");
  const { theme } = useTheme();
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);

  useEffect(() => {
    if (show) {
      setSubtasks(initialSubtasks);
    }
  }, [show, initialSubtasks]);

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

  // Use Gemini RAG-powered API for auto-assigning subtasks
  const handleAutoAssignAll = useCallback(async () => {
    if (!subtasks.length) return;
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignSubtasks: { subtasks },
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.assignments)) {
        setSubtasks(subtasks =>
          subtasks.map((subtask, i) => ({
            ...subtask,
            assignedTo:
              data.assignments.find((a: any) => a.subtaskIndex === i)?.userId || ""
          }))
        );
      }
    } catch (error) {
      console.error("Error auto-assigning subtasks via Gemini:", error);
    }
  }, [subtasks]);



  // Auto assign one subtask using Gemini API
  const handleAutoAssignOne = useCallback(async (index: number) => {
    if (!subtasks[index]) return;
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignSubtasks: { subtasks: [subtasks[index]] },
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.assignments) && data.assignments[0]) {
        setSubtasks(subtasks => {
          const updated = [...subtasks];
          updated[index].assignedTo = data.assignments[0].userId || "";
          return updated;
        });
      }
    } catch (error) {
      console.error("Error auto-assigning subtask via Gemini:", error);
    }
  }, [subtasks]);

  // Memoize add/remove/update subtask handlers
  const addManualSubtask = useCallback(() => {
    setSubtasks([...subtasks, { title: "", description: "" }]);
  }, [subtasks]);

  const removeSubtask = useCallback((index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  }, [subtasks]);

  const updateSubtask = useCallback((index: number, field: 'title' | 'description' | 'assignedTo', value: string) => {
    const updated = [...subtasks];
    updated[index][field] = value;
    setSubtasks(updated);
  }, [subtasks]);

  // Memoize save handler
  const handleSave = useCallback(() => {
    const validSubtasks = subtasks.filter(s => s.title.trim());
    onSave(validSubtasks);
  }, [subtasks, onSave]);

  // Memoize filtered usersBelowMe
  const filteredUsersBelowMe = useMemo(() => (
    (usersBelowMe || [])
      .filter(u =>
        u.user &&
        u.userId &&
        (!currentUserId || u.userId !== currentUserId)
      )
  ), [usersBelowMe, currentUserId]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[80vh] relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white'}`}>
        {/* Close Button */}
        <button
          className={`absolute top-4 right-4 text-xl font-bold z-10 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          onClick={onCancel}
          aria-label={t("cancel")}
          >
          <FaTimes />
        </button>

        {/* Header */}
        <div className={`p-6 border-b flex items-center gap-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
            <FaTasks className="text-lg text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("breakDownTask")}</h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>"{taskTitle}" - {t("subtasks")}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 h-[calc(100%-180px)]">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t("subtasks")}</h3>
          <div className="flex gap-3">
            <Button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-sm font-medium shadow-sm hover:bg-blue-600 transition disabled:opacity-60"
              onClick={handleGenerateSubtasks}
              disabled={!taskTitle || generatingSubtasks}
            >
              {generatingSubtasks ? (
                <FaSpinner className="animate-spin mr-2 w-4 h-4" />
              ) : (
                <FaRobot className="mr-2 w-4 h-4" />
              )}
              {t("generateDescription")}
            </Button>
            <Button
              type="button"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center text-sm font-medium shadow-sm hover:bg-purple-600 transition"
              onClick={handleAutoAssignAll}
            >
              <FaUser className="mr-2 w-4 h-4" />
              Auto Assign
            </Button>
            <Button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center text-sm font-medium shadow-sm hover:bg-green-600 transition"
              onClick={addManualSubtask}
            >
              <FaPlus className="mr-2 w-4 h-4" />
              {t("addTask")}
            </Button>
          </div>
          </div>

          {/* Subtasks List */}
          <div className="h-full overflow-y-auto">
            {subtasks.length === 0 ? (
              <div className={`text-center py-12 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <FaTasks className={`text-4xl mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t("noSubtasksMessage")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subtasks.map((subtask, index) => (
                  <div key={index} className={`flex gap-3 items-start p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex-1 space-y-3">
                      <Input
                        type="text"
                        placeholder={t("subtaskTitle")}
                        value={subtask.title}
                        onChange={e => updateSubtask(index, 'title', e.target.value)}
                        className={`w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white placeholder-gray-400' : 'border border-gray-300'}`}
                      />
                      <textarea
                        placeholder={t("subtaskDescription")}
                        value={subtask.description}
                        onChange={e => updateSubtask(index, 'description', e.target.value)}
                        rows={2}
                        className={`w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white placeholder-gray-400' : 'border border-gray-300'}`}
                      />
                      <select
                        value={subtask.assignedTo || ""}
                        onChange={e => updateSubtask(index, 'assignedTo', e.target.value)}
                        className={`w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'border border-gray-300'}`}
                      >
                        <option value="">
                          <FaUser className="inline-block mr-1" />{t("assignToMyself")}
                        </option>
                        {filteredUsersBelowMe.map(u => (
                          <option key={u.userId} value={u.userId}>
                            <FaUser className="inline-block mr-1" />{u.user?.firstName} {u.user?.lastName} ({u.user?.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleAutoAssignOne(index)}
                        className={`w-9 h-9 p-0 flex items-center justify-center rounded-full transition-colors duration-200 ${theme === 'dark' ? 'text-purple-400 hover:text-purple-200 hover:bg-purple-900' : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'}`}
                        aria-label="Auto Assign"
                      >
                        <FaUser className="w-5 h-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeSubtask(index)}
                        className={`w-9 h-9 p-0 flex items-center justify-center rounded-full transition-colors duration-200 ${theme === 'dark' ? 'text-red-400 hover:text-red-200 hover:bg-red-900' : 'text-red-500 hover:text-red-700 hover:bg-red-50'}`}
                        aria-label="Remove Subtask"
                      >
                        <FaTrash className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className={`p-6 border-t flex justify-between items-center ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t("subtasksReady", { count: subtasks.filter(s => s.title.trim()).length })}</p>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onCancel}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              variant="ghost"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 ${theme === 'dark' ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {t("saveSubtasks")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtasksModal;
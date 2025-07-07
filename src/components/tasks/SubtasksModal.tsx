import React, { useState, useEffect } from "react";
import { FaSpinner, FaRobot, FaPlus, FaTrash, FaTimes, FaTasks } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Subtask {
  title: string;
  description: string;
}

interface SubtasksModalProps {
  show: boolean;
  taskTitle: string;
  taskDescription: string;
  initialSubtasks: Subtask[];
  onSave: (subtasks: Subtask[]) => void;
  onCancel: () => void;
}

const SubtasksModal: React.FC<SubtasksModalProps> = ({
  show,
  taskTitle,
  taskDescription,
  initialSubtasks,
  onSave,
  onCancel,
}) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);

  useEffect(() => {
    if (show) {
      setSubtasks(initialSubtasks);
    }
  }, [show, initialSubtasks]);

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

  const handleSave = () => {
    const validSubtasks = subtasks.filter(s => s.title.trim());
    onSave(validSubtasks);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[80vh] relative overflow-hidden">
        {/* Close Button */}
        <Button
          type="button"
          variant="ghost"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl z-10 bg-transparent p-2 rounded-full"
          onClick={onCancel}
          aria-label="Close modal"
        >
          <FaTimes />
        </Button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
              <FaTasks className="text-lg text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Break Down Task</h2>
              <p className="text-sm text-gray-600 mt-1">
                "{taskTitle}" - Create subtasks to organize your work
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 h-[calc(100%-180px)]">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Subtasks</h3>
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
                AI Generate
              </Button>
              <Button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center text-sm font-medium shadow-sm hover:bg-green-600 transition"
                onClick={addManualSubtask}
              >
                <FaPlus className="mr-2 w-4 h-4" />
                Add Manual
              </Button>
            </div>
          </div>

          {/* Subtasks List */}
          <div className="h-full overflow-y-auto">
            {subtasks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FaTasks className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  No subtasks added yet. Generate with AI or add manually.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 space-y-3">
                      <Input
                        type="text"
                        placeholder="Subtask title"
                        value={subtask.title}
                        onChange={e => updateSubtask(index, 'title', e.target.value)}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                      <textarea
                        placeholder="Subtask description (optional)"
                        value={subtask.description}
                        onChange={e => updateSubtask(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeSubtask(index)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {subtasks.filter(s => s.title.trim()).length} of {subtasks.length} subtasks ready
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                Save Subtasks
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtasksModal;
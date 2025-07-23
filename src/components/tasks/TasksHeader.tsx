import React from "react";
import { Button } from "@/components/ui/button";
import { FaPlus, FaTasks, FaUserCheck } from "react-icons/fa";

interface TasksHeaderProps {
  theme: string;
  activeTab: 'my-tasks' | 'assigned-tasks';
  setActiveTab: (tab: 'my-tasks' | 'assigned-tasks') => void;
  onCreate: () => void;
  loading: boolean;
  t: (key: string) => string;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  theme,
  activeTab,
  setActiveTab,
  onCreate,
  loading,
  t,
}) => (
  <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 lg:px-8 pt-10`}>
    <div className="max-w-[100vw] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className={`flex rounded-xl p-1 gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}> 
          <Button
            type="button"
            onClick={() => setActiveTab('my-tasks')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
              ${activeTab === 'my-tasks'
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-blue-700'
                  : 'text-gray-600 hover:text-white hover:bg-blue-500'
              }`}
            variant="ghost"
          >
            <FaTasks className="w-4 h-4" />
            <span>{t("myTasks")}</span>
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab('assigned-tasks')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
              ${activeTab === 'assigned-tasks'
                ? theme === 'dark'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-green-700'
                  : 'text-gray-600 hover:text-white hover:bg-green-500'
              }`}
            variant="ghost"
          >
            <FaUserCheck className="w-4 h-4" />
            <span>{t("assignedByMe")}</span>
          </Button>
        </div>
        <Button
          type="button"
          onClick={onCreate}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 group ${
            theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={loading}
        >
          <FaPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>{t("createTask")}</span>
        </Button>
      </div>
    </div>
  </div>
);

export default TasksHeader;

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import TasksExportDropdown from "./TasksExportDropdown";
import TaskList from "./TaskList";
import AssignedTasksList from "./AssignedTasksList";
import { FaTasks, FaUserCheck } from "react-icons/fa";

interface TasksTabPanelProps {
  theme: string;
  activeTab: 'my-tasks' | 'assigned-tasks';
  t: (key: string) => string;
  tasks: any[];
  assignedTasks: any[];
  loading: boolean;
  currentUserEmail: string;
  handleEditClick: (task: any) => void;
  handleDeleteTask: (id: string) => void;
  handleToggleComplete: (task: any) => void;
  isTaskOverdue: (task: any) => boolean;
  mySearch: string;
  setMySearch: (s: string) => void;
  myFilterStatus: "all" | "completed" | "pending" | "overdue";
  setMyFilterStatus: (s: "all" | "completed" | "pending" | "overdue") => void;
  myFilterPriority: "all" | "critical" | "high" | "medium" | "low";
  setMyFilterPriority: (s: "all" | "critical" | "high" | "medium" | "low") => void;
  mySortBy: "createdAtDesc" | "deadlineAsc" | "priorityDesc";
  setMySortBy: (s: "createdAtDesc" | "deadlineAsc" | "priorityDesc") => void;
  assignedSearch: string;
  setAssignedSearch: (s: string) => void;
  assignedFilterStatus: "all" | "completed" | "pending" | "overdue";
  setAssignedFilterStatus: (s: "all" | "completed" | "pending" | "overdue") => void;
  assignedFilterPriority: "all" | "critical" | "high" | "medium" | "low";
  setAssignedFilterPriority: (s: "all" | "critical" | "high" | "medium" | "low") => void;
  assignedSortBy: "createdAtDesc" | "deadlineAsc" | "priorityDesc";
  setAssignedSortBy: (s: "createdAtDesc" | "deadlineAsc" | "priorityDesc") => void;
  handleExportPDF: () => void;
  handleExportCSV: () => void;
}

const TasksTabPanel: React.FC<TasksTabPanelProps> = ({
  theme,
  activeTab,
  t,
  tasks,
  assignedTasks,
  loading,
  currentUserEmail,
  handleEditClick,
  handleDeleteTask,
  handleToggleComplete,
  isTaskOverdue,
  mySearch,
  setMySearch,
  myFilterStatus,
  setMyFilterStatus,
  myFilterPriority,
  setMyFilterPriority,
  mySortBy,
  setMySortBy,
  assignedSearch,
  setAssignedSearch,
  assignedFilterStatus,
  setAssignedFilterStatus,
  assignedFilterPriority,
  setAssignedFilterPriority,
  assignedSortBy,
  setAssignedSortBy,
  handleExportPDF,
  handleExportCSV,
}) => (
  <Card className={`${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-2xl border ${theme === "light" ? "border-gray-200" : "border-gray-700"} overflow-hidden mx-2`}>
    {activeTab === 'my-tasks' ? (
      <div className="flex flex-col">
        <CardHeader className={`p-6 ${theme === "light" ? "bg-blue-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <FaTasks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>{t("myTasks")}</h2>
                <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>{t("myTasksDescription")}</p>
              </div>
            </div>
            <TasksExportDropdown theme={theme} onExportPDF={handleExportPDF} onExportCSV={handleExportCSV} t={t} />
          </div>
        </CardHeader>
        <CardContent className={`p-3 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
          <TaskList
            tasks={tasks}
            currentUserEmail={currentUserEmail}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
            isTaskOverdue={isTaskOverdue}
            theme={theme}
            controlsOnly
            search={mySearch}
            onSearchChange={setMySearch}
            filterStatus={myFilterStatus}
            onFilterStatusChange={setMyFilterStatus}
            filterPriority={myFilterPriority}
            onFilterPriorityChange={setMyFilterPriority}
            sortBy={mySortBy}
            onSortByChange={setMySortBy}
          />
        </CardContent>
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          <TaskList
            tasks={tasks}
            currentUserEmail={currentUserEmail}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
            isTaskOverdue={isTaskOverdue}
            theme={theme}
            cardsOnly
            search={mySearch}
            onSearchChange={setMySearch}
            filterStatus={myFilterStatus}
            onFilterStatusChange={setMyFilterStatus}
            filterPriority={myFilterPriority}
            onFilterPriorityChange={setMyFilterPriority}
            sortBy={mySortBy}
            onSortByChange={setMySortBy}
          />
        </div>
      </div>
    ) : (
      <div className="flex flex-col">
        <CardHeader className={`p-6 ${theme === "light" ? "bg-green-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-600' : 'bg-green-500'}`}>
              <FaUserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>{t("tasksAssignedByMe")}</h2>
              <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>{t("assignedTasksDescription")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`p-3 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"} border-b`}>
          <AssignedTasksList
            tasks={assignedTasks}
            currentUserEmail={currentUserEmail}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteTask}
            isTaskOverdue={isTaskOverdue}
            controlsOnly
            search={assignedSearch}
            onSearchChange={setAssignedSearch}
            filterStatus={assignedFilterStatus}
            onFilterStatusChange={setAssignedFilterStatus}
            filterPriority={assignedFilterPriority}
            onFilterPriorityChange={setAssignedFilterPriority}
            sortBy={assignedSortBy}
            onSortByChange={setAssignedSortBy}
          />
        </CardContent>
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          <AssignedTasksList
            tasks={assignedTasks}
            currentUserEmail={currentUserEmail}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteTask}
            isTaskOverdue={isTaskOverdue}
            cardsOnly
            search={assignedSearch}
            onSearchChange={setAssignedSearch}
            filterStatus={assignedFilterStatus}
            onFilterStatusChange={setAssignedFilterStatus}
            filterPriority={assignedFilterPriority}
            onFilterPriorityChange={setAssignedFilterPriority}
            sortBy={assignedSortBy}
            onSortByChange={setAssignedSortBy}
          />
        </div>
      </div>
    )}
  </Card>
);

export default TasksTabPanel;

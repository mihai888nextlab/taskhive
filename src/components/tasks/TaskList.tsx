import React from "react";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: any[];
  currentUserEmail: string;
  loading: boolean;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: any) => void;
  isTaskOverdue: (task: any) => boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentUserEmail,
  loading,
  onEdit,
  onDelete,
  onToggleComplete,
  isTaskOverdue,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
    {tasks.map(task => (
      <TaskCard
        key={task._id}
        task={task}
        currentUserEmail={currentUserEmail}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
        isTaskOverdue={isTaskOverdue}
      />
    ))}
  </div>
);

export default TaskList;
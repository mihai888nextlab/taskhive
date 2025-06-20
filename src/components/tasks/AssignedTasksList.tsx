import React from "react";
import TaskCard from "./TaskCard";

interface AssignedTasksListProps {
  assignedTasks: any[];
  loading: boolean;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  isTaskOverdue: (task: any) => boolean;
}

const AssignedTasksList: React.FC<AssignedTasksListProps> = ({
  assignedTasks,
  loading,
  onEdit,
  onDelete,
  isTaskOverdue,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
    {assignedTasks.map(task => (
      <TaskCard
        key={task._id}
        task={task}
        currentUserEmail={task.createdBy?.email || ""}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={() => {}}
        isTaskOverdue={isTaskOverdue}
      />
    ))}
  </div>
);

export default AssignedTasksList;
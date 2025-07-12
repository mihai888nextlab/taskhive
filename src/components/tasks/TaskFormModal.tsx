import React from "react";
import { createPortal } from "react-dom";
import TaskForm from "./TaskForm";

const TaskFormModal: React.FC<{ show: boolean } & Record<string, any>> = ({
  show,
  ...props
}) => {
  if (!show || typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] relative animate-fadeIn overflow-hidden">
        <TaskForm
          {...props}
          show={true}
          loading={props.loading}
          editingTaskId={props.editingTaskId}
          taskTitle={props.taskTitle}
          taskDescription={props.taskDescription}
          taskDeadline={props.taskDeadline}
          assignedTo={props.assignedTo}
          usersBelowMe={props.usersBelowMe}
          formError={props.formError}
          onSubmit={props.onSubmit}
          onCancel={props.onCancel}
          priority={props.priority}
          theme={props.theme}
          onTitleChange={props.onTitleChange}
          onDescriptionChange={props.onDescriptionChange}
          onDeadlineChange={props.onDeadlineChange}
          onAssignedToChange={props.onAssignedToChange}
          onPriorityChange={props.onPriorityChange}
        />
      </div>
    </div>,
    document.body
  );
};

export default TaskFormModal;

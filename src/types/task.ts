export interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  priority: "critical" | "high" | "medium" | "low";
  userId: any;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  isSubtask?: boolean;
  parentTask?: Task | string; // <-- Allow for populated or just ID
  subtasks?: Task[];
  tags?: string[]; // <-- Add this line
}

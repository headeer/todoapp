export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  checklistItems: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  isMain: boolean;
  viewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

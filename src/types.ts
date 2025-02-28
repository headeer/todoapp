export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  priority: "low" | "medium" | "high";
  checklistItems: ChecklistItem[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  logo: string;
  isMain: boolean;
  viewed: boolean;
  createdAt: Date;
  updatedAt: Date;
  taskCount?: number;
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface ChecklistItem {
  id: string;
  title: string;
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
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  checklistItems: ChecklistItem[];
  plannedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  plannedDate: string | null;
  createdAt: string;
  updatedAt: string;
  checklistItems: ChecklistItemData[];
}

export interface ChecklistItemData {
  id: string;
  title: string;
  text: string;
  completed: boolean;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export const validateTaskStatus = (status: string): status is TaskStatus => {
  return Object.values(TaskStatus).includes(status as TaskStatus);
};

export const validateTaskPriority = (
  priority: string
): priority is TaskPriority => {
  return Object.values(TaskPriority).includes(priority as TaskPriority);
};

export function mapChecklistItemDataToChecklistItem(
  itemData: ChecklistItemData
): ChecklistItem {
  return {
    id: itemData.id,
    title: itemData.title,
    text: itemData.text,
    completed: itemData.completed,
    taskId: itemData.taskId,
    createdAt: new Date(itemData.createdAt),
    updatedAt: new Date(itemData.updatedAt),
  };
}

export function mapTaskDataToTask(taskData: TaskData): Task {
  return {
    id: taskData.id,
    title: taskData.title,
    description: taskData.description || "",
    status: validateTaskStatus(taskData.status)
      ? (taskData.status as TaskStatus)
      : TaskStatus.TODO,
    priority: validateTaskPriority(taskData.priority)
      ? (taskData.priority as TaskPriority)
      : TaskPriority.MEDIUM,
    projectId: taskData.projectId,
    plannedDate: taskData.plannedDate ? new Date(taskData.plannedDate) : null,
    createdAt: new Date(taskData.createdAt),
    updatedAt: new Date(taskData.updatedAt),
    checklistItems: taskData.checklistItems.map(
      mapChecklistItemDataToChecklistItem
    ),
  };
}

export const createNewTask = (projectId: string): Task => {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId,
    checklistItems: [],
    plannedDate: null,
    createdAt: now,
    updatedAt: now,
  };
};

export const createNewChecklistItem = (taskId: string): ChecklistItem => {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: "",
    text: "",
    completed: false,
    taskId,
    createdAt: now,
    updatedAt: now,
  };
};

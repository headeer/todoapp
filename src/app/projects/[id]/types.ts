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
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  checklistItems: {
    id: string;
    title: string;
    text: string;
    completed: boolean;
    taskId: string;
    createdAt: string;
    updatedAt: string;
  }[];
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

export const mapTaskDataToTask = (taskData: TaskData): Task => {
  return {
    ...taskData,
    status: TaskStatus[taskData.status as keyof typeof TaskStatus],
    priority: TaskPriority[taskData.priority as keyof typeof TaskPriority],
    checklistItems: taskData.checklistItems.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    createdAt: new Date(taskData.createdAt),
    updatedAt: new Date(taskData.updatedAt),
  };
};

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

import {
  Project,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/app/projects/[id]/types";

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Modernize the company website with a fresh look",
    viewed: true,
    isMain: true,
    logo: "/project-logo.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Create a new mobile app for our customers",
    viewed: false,
    isMain: false,
    logo: "/project-logo.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "project-3",
    name: "Marketing Campaign",
    description: "Q2 marketing campaign planning and execution",
    viewed: true,
    isMain: false,
    logo: "",
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design Homepage",
    description: "Create a modern and user-friendly homepage design",
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    projectId: "1",
    checklistItems: [
      {
        id: "1",
        text: "Create wireframe",
        completed: true,
        taskId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        text: "Design UI components",
        completed: false,
        taskId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Implement Authentication",
    description: "Add user authentication and authorization",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    projectId: "1",
    checklistItems: [
      {
        id: "3",
        text: "Set up auth provider",
        completed: true,
        taskId: "2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        text: "Create login/signup forms",
        completed: false,
        taskId: "2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "project-1-task-3",
    title: "Optimize Images",
    description: "Optimize all images for better performance",
    status: "DONE",
    projectId: "project-1",
    priority: "low",
    checklistItems: [
      {
        id: "project-1-task-3-checklist-1",
        text: "Compress all images",
        completed: true,
      },
      {
        id: "project-1-task-3-checklist-2",
        text: "Implement lazy loading",
        completed: true,
      },
    ],
  },
  {
    id: "project-2-task-1",
    title: "SEO Improvements",
    description: "Implement SEO best practices",
    status: "TODO",
    projectId: "project-2",
    priority: "medium",
    checklistItems: [
      {
        id: "project-2-task-1-checklist-1",
        text: "Update meta tags",
        completed: false,
      },
      {
        id: "project-2-task-1-checklist-2",
        text: "Add structured data",
        completed: false,
      },
    ],
  },
  {
    id: "project-2-task-2",
    title: "Mobile Responsiveness",
    description: "Ensure website works well on all devices",
    status: "IN_PROGRESS",
    projectId: "project-2",
    priority: "high",
    checklistItems: [
      {
        id: "project-2-task-2-checklist-1",
        text: "Test on iOS devices",
        completed: true,
      },
      {
        id: "project-2-task-2-checklist-2",
        text: "Test on Android devices",
        completed: false,
      },
    ],
  },
];

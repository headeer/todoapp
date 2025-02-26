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
    id: "3",
    name: "Marketing Campaign",
    description: "Q2 marketing campaign planning and execution",
    viewed: true,
    isMain: false,
    logo: "/project-logo.png",
    createdAt: new Date(),
    updatedAt: new Date(),
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
        title: "Create wireframe",
        text: "Create wireframe",
        completed: true,
        taskId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Design UI components",
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
        title: "Set up auth provider",
        text: "Set up auth provider",
        completed: true,
        taskId: "2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        title: "Create login/signup forms",
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
    id: "3",
    title: "Optimize Images",
    description: "Optimize all images for better performance",
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    projectId: "1",
    checklistItems: [
      {
        id: "5",
        title: "Compress all images",
        text: "Compress all images",
        completed: true,
        taskId: "3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "6",
        title: "Implement lazy loading",
        text: "Implement lazy loading",
        completed: true,
        taskId: "3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "SEO Improvements",
    description: "Implement SEO best practices",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: "2",
    checklistItems: [
      {
        id: "7",
        title: "Update meta tags",
        text: "Update meta tags",
        completed: false,
        taskId: "4",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "8",
        title: "Add structured data",
        text: "Add structured data",
        completed: false,
        taskId: "4",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Mobile Responsiveness",
    description: "Ensure website works well on all devices",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    projectId: "2",
    checklistItems: [
      {
        id: "9",
        title: "Test on iOS devices",
        text: "Test on iOS devices",
        completed: true,
        taskId: "5",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "10",
        title: "Test on Android devices",
        text: "Test on Android devices",
        completed: false,
        taskId: "5",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

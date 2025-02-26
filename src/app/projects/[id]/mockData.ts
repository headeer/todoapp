import { Project, Task } from "@/app/projects/[id]/types";

export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Website Redesign",
    description: "Redesign company website with new branding",
    viewed: true,
    isMain: true,
    logo: "",
  },
  {
    id: "project-2",
    name: "Mobile App Development",
    description: "Create a new mobile app for customers",
    viewed: false,
    isMain: false,
    logo: "",
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
    id: "project-1-task-1",
    title: "Design Homepage",
    description: "Create a modern and user-friendly homepage design",
    status: "TODO",
    projectId: "project-1",
    priority: "high",
    checklistItems: [
      {
        id: "project-1-task-1-checklist-1",
        text: "Create wireframe",
        completed: true,
      },
      {
        id: "project-1-task-1-checklist-2",
        text: "Design UI components",
        completed: false,
      },
    ],
  },
  {
    id: "project-1-task-2",
    title: "Implement Contact Form",
    description: "Add a contact form with validation",
    status: "IN_PROGRESS",
    projectId: "project-1",
    priority: "medium",
    checklistItems: [
      {
        id: "project-1-task-2-checklist-1",
        text: "Create form component",
        completed: true,
      },
      {
        id: "project-1-task-2-checklist-2",
        text: "Add validation",
        completed: false,
      },
    ],
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

import {
  Project,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/app/projects/[id]/types";
import { prisma } from "./prisma";

// Initialize with default data if empty
const defaultProject = {
  name: "Website Redesign",
  description: "Modernize the company website with a fresh look",
  logo: "/project-logo.png",
  isMain: true,
  viewed: false,
};

const defaultTask = {
  title: "Design Homepage",
  description: "Create a modern and user-friendly homepage design",
  status: TaskStatus.TODO,
  priority: TaskPriority.HIGH,
  checklistItems: {
    create: [
      {
        text: "Create wireframe",
        completed: true,
      },
      {
        text: "Design UI components",
        completed: false,
      },
    ],
  },
};

// Initialize storage with default data
async function initStorage() {
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    const project = await prisma.project.create({
      data: defaultProject,
    });

    await prisma.task.create({
      data: {
        ...defaultTask,
        projectId: project.id,
      },
    });
  }
}

// Projects
export async function getProjects(): Promise<Project[]> {
  await initStorage();
  const projects = await prisma.project.findMany();
  return projects.map((p) => ({
    ...p,
    description: p.description || undefined,
    logo: p.logo || undefined,
  }));
}

export async function getProject(id: string): Promise<Project | null> {
  await initStorage();
  const project = await prisma.project.findUnique({
    where: { id },
  });
  if (!project) return null;
  return {
    ...project,
    description: project.description || undefined,
    logo: project.logo || undefined,
  };
}

export async function saveProject(project: Project): Promise<Project> {
  await initStorage();
  const saved = await prisma.project.upsert({
    where: { id: project.id },
    update: project,
    create: project,
  });
  return {
    ...saved,
    description: saved.description || undefined,
    logo: saved.logo || undefined,
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  await initStorage();
  await prisma.project.delete({
    where: { id },
  });
  return true;
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  await initStorage();
  const tasks = await prisma.task.findMany({
    include: {
      checklistItems: true,
    },
  });
  return tasks.map((task) => ({
    ...task,
    description: task.description || "",
    checklistItems: task.checklistItems.map((item) => ({
      ...item,
    })),
  }));
}

export async function getTask(id: string): Promise<Task | null> {
  await initStorage();
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      checklistItems: true,
    },
  });
  if (!task) return null;
  return {
    ...task,
    description: task.description || "",
    checklistItems: task.checklistItems.map((item) => ({
      ...item,
    })),
  };
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  await initStorage();
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      checklistItems: true,
    },
  });
  return tasks.map((task) => ({
    ...task,
    description: task.description || "",
    checklistItems: task.checklistItems.map((item) => ({
      ...item,
    })),
  }));
}

export async function saveTask(task: Task): Promise<Task> {
  await initStorage();
  const { checklistItems, ...taskData } = task;

  const saved = await prisma.task.upsert({
    where: { id: task.id },
    update: {
      ...taskData,
      checklistItems: {
        deleteMany: {},
        create: checklistItems.map((item) => ({
          text: item.text,
          completed: item.completed,
        })),
      },
    },
    create: {
      ...taskData,
      checklistItems: {
        create: checklistItems.map((item) => ({
          text: item.text,
          completed: item.completed,
        })),
      },
    },
    include: {
      checklistItems: true,
    },
  });

  return {
    ...saved,
    description: saved.description || "",
    checklistItems: saved.checklistItems.map((item) => ({
      ...item,
    })),
  };
}

export async function deleteTask(id: string): Promise<boolean> {
  await initStorage();
  await prisma.task.delete({
    where: { id },
  });
  return true;
}

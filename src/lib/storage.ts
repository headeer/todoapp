import {
  Project,
  Task,
  TaskStatus,
  TaskPriority,
  ChecklistItem,
} from "@/app/projects/[id]/types";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";

type PrismaTask = Prisma.TaskGetPayload<{ include: { checklistItems: true } }>;
type PrismaChecklistItem = Prisma.ChecklistItemGetPayload<{
  select: {
    id: true;
    title: true;
    completed: true;
    taskId: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

// Helper function to convert Prisma Task to our Task type
function convertPrismaTask(prismaTask: PrismaTask): Task {
  return {
    id: prismaTask.id,
    title: prismaTask.title,
    description: prismaTask.description || "",
    status: prismaTask.status as TaskStatus,
    priority: prismaTask.priority as TaskPriority,
    projectId: prismaTask.projectId,
    plannedDate: (prismaTask as any).plannedDate
      ? new Date((prismaTask as any).plannedDate)
      : null,
    checklistItems: prismaTask.checklistItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      text: item.text || item.title,
      completed: item.completed,
      taskId: item.taskId,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    createdAt: new Date(prismaTask.createdAt),
    updatedAt: new Date(prismaTask.updatedAt),
  };
}

// Helper function to convert our Task type to Prisma create format
function convertToPrismaCreateTask(
  task: Partial<Task>
): Prisma.TaskCreateInput {
  if (!task.title || !task.description || !task.projectId) {
    throw new Error("Missing required fields for task creation");
  }

  return {
    title: task.title,
    description: task.description,
    status: task.status || "TODO",
    priority: (task.priority || "MEDIUM").toUpperCase(),
    plannedDate: task.plannedDate,
    project: {
      connect: { id: task.projectId },
    },
    checklistItems: task.checklistItems
      ? {
          create: task.checklistItems.map((item) => ({
            title: item.text || "",
            completed: item.completed || false,
          })),
        }
      : undefined,
  };
}

// Helper function to convert our Task type to Prisma update format
function convertToPrismaUpdateTask(
  task: Partial<Task>
): Prisma.TaskUpdateInput {
  const data: Prisma.TaskUpdateInput = {};

  if (task.title) data.title = task.title;
  if (task.description) data.description = task.description;
  if (task.status) data.status = task.status.toUpperCase();
  if (task.priority) data.priority = task.priority.toUpperCase();
  if (task.plannedDate !== undefined) data.plannedDate = task.plannedDate;
  if (task.projectId) {
    data.project = { connect: { id: task.projectId } };
  }

  if (task.checklistItems) {
    data.checklistItems = {
      deleteMany: {},
      create: task.checklistItems.map((item) => ({
        title: item.text || "",
        completed: item.completed || false,
      })),
    };
  }

  return data;
}

export async function getTasks(): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    include: { checklistItems: true },
  });
  return tasks.map(convertPrismaTask);
}

export async function getTask(id: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { checklistItems: true },
  });
  return task ? convertPrismaTask(task) : null;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { checklistItems: true },
  });
  return tasks.map(convertPrismaTask);
}

export async function saveTask(task: Partial<Task>): Promise<Task> {
  if (task.id) {
    // Update existing task
    const updated = await prisma.task.update({
      where: { id: task.id },
      data: convertToPrismaUpdateTask(task),
      include: { checklistItems: true },
    });
    return convertPrismaTask(updated);
  } else {
    // Create new task
    const created = await prisma.task.create({
      data: convertToPrismaCreateTask(task),
      include: { checklistItems: true },
    });
    return convertPrismaTask(created);
  }
}

export async function deleteTask(id: string): Promise<void> {
  await prisma.task.delete({
    where: { id },
  });
}

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
  status: "TODO",
  priority: "HIGH",
  checklistItems: {
    create: [
      {
        title: "Create wireframe",
        completed: true,
      },
      {
        title: "Design UI components",
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
  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return projects.map((p) => ({
    ...p,
    description: p.description || "",
    logo: p.logo || "/default-logo.png",
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    taskCount: p._count.tasks,
  }));
}

export async function getProject(id: string): Promise<Project | null> {
  await initStorage();
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
  if (!project) return null;
  return {
    ...project,
    description: project.description || "",
    logo: project.logo || "/default-logo.png",
    taskCount: project._count.tasks,
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
    description: saved.description || "",
    logo: saved.logo || "/default-logo.png",
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  await initStorage();
  await prisma.project.delete({
    where: { id },
  });
  return true;
}

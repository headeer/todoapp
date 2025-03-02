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

// Helper function to safely convert date strings
function safeDate(dateValue: string | Date | null): Date | null {
  if (!dateValue) return null;
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (error) {
    console.error("Invalid date value:", dateValue);
    return null;
  }
}

// Helper function to convert Prisma Task to our Task type
function convertPrismaTask(prismaTask: PrismaTask): Task {
  return {
    id: prismaTask.id,
    title: prismaTask.title,
    description: prismaTask.description || "",
    status: prismaTask.status as TaskStatus,
    priority: prismaTask.priority as TaskPriority,
    projectId: prismaTask.projectId,
    plannedDate: safeDate(prismaTask.plannedDate),
    checklistItems: prismaTask.checklistItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      text: item.text || item.title,
      completed: item.completed,
      taskId: item.taskId,
      createdAt: safeDate(item.createdAt) || new Date(),
      updatedAt: safeDate(item.updatedAt) || new Date(),
    })),
    createdAt: safeDate(prismaTask.createdAt) || new Date(),
    updatedAt: safeDate(prismaTask.updatedAt) || new Date(),
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
        title: item.text || item.title || "",
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
  console.log("Saving task:", JSON.stringify(task, null, 2));
  if (task.id) {
    // Update existing task
    console.log(`Updating existing task with ID: ${task.id}`);
    const updated = await prisma.task.update({
      where: { id: task.id },
      data: convertToPrismaUpdateTask(task),
      include: { checklistItems: true },
    });
    console.log("Task updated successfully");
    return convertPrismaTask(updated);
  } else {
    // Create new task
    console.log("Creating new task");
    const created = await prisma.task.create({
      data: convertToPrismaCreateTask(task),
      include: { checklistItems: true },
    });
    console.log(`New task created with ID: ${created.id}`);
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
let storageInitialized = false;
async function initStorage() {
  // Only run once
  if (storageInitialized) return;

  console.log("Checking if storage needs initialization...");
  const projectCount = await prisma.project.count();
  console.log(`Found ${projectCount} existing projects`);

  if (projectCount === 0) {
    console.log("Initializing storage with default data...");
    const project = await prisma.project.create({
      data: defaultProject,
    });

    await prisma.task.create({
      data: {
        ...defaultTask,
        projectId: project.id,
      },
    });
    console.log("Default data created successfully");
  }

  storageInitialized = true;
}

// Projects
export async function getProjects(): Promise<Project[]> {
  await initStorage();
  console.log("Fetching all projects...");
  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
  console.log(`Retrieved ${projects.length} projects`);

  return projects.map((p) => ({
    ...p,
    description: p.description || "",
    logo: p.logo || "/default-logo.png",
    createdAt: safeDate(p.createdAt) || new Date(),
    updatedAt: safeDate(p.updatedAt) || new Date(),
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
    createdAt: safeDate(project.createdAt) || new Date(),
    updatedAt: safeDate(project.updatedAt) || new Date(),
    taskCount: project._count.tasks,
  };
}

export async function saveProject(project: Project): Promise<Project> {
  await initStorage();

  // Extract only the fields that Prisma expects
  const { id, taskCount, ...updateData } = project;

  const saved = await prisma.project.upsert({
    where: { id: project.id },
    update: {
      name: updateData.name,
      description: updateData.description,
      logo: updateData.logo,
      isMain: updateData.isMain,
      viewed: updateData.viewed,
    },
    create: {
      id: project.id,
      name: updateData.name,
      description: updateData.description || "",
      logo: updateData.logo || "/default-logo.png",
      isMain: updateData.isMain || false,
      viewed: updateData.viewed || false,
    },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return {
    ...saved,
    description: saved.description || "",
    logo: saved.logo || "/default-logo.png",
    taskCount: saved._count.tasks,
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  await initStorage();
  await prisma.project.delete({
    where: { id },
  });
  return true;
}

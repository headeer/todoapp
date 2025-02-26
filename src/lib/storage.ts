import { promises as fs } from "fs";
import path from "path";
import { Project, Task } from "@/app/projects/[id]/types";

// Use public directory in production, data directory in development
const BASE_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "public", "data")
    : path.join(process.cwd(), "data");

const DATA_DIR = BASE_DIR;
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

// Initialize storage
async function initStorage() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    console.error("Error accessing DATA_DIR:", {
      error,
      DATA_DIR,
      cwd: process.cwd(),
      env: process.env.NODE_ENV,
    });
    try {
      // Create the full path recursively
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log("Created DATA_DIR successfully");

      // Initialize empty files if they don't exist
      try {
        await fs.access(PROJECTS_FILE);
      } catch {
        await fs.writeFile(PROJECTS_FILE, "[]");
      }

      try {
        await fs.access(TASKS_FILE);
      } catch {
        await fs.writeFile(TASKS_FILE, "[]");
      }
    } catch (mkdirError: unknown) {
      console.error("Error creating DATA_DIR:", {
        error: mkdirError,
        DATA_DIR,
      });
      if (mkdirError instanceof Error) {
        throw new Error(
          `Failed to create data directory: ${mkdirError.message}`
        );
      }
      throw new Error("Failed to create data directory");
    }
  }
}

// Projects
export async function getProjects(): Promise<Project[]> {
  await initStorage();
  try {
    const content = await fs.readFile(PROJECTS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function saveProject(project: Project): Promise<Project> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  await initStorage();
  try {
    const content = await fs.readFile(TASKS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading tasks file:", {
      error,
      TASKS_FILE,
      exists: await fs
        .access(TASKS_FILE)
        .then(() => true)
        .catch(() => false),
    });
    return [];
  }
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    const tasks = await getTasks();
    return tasks.find((t) => t.id === id) || null;
  } catch (error) {
    console.error("Error getting task by id:", {
      error,
      taskId: id,
    });
    throw error;
  }
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const tasks = await getTasks();
  return tasks.filter((t) => t.projectId === projectId);
}

export async function saveTask(task: Task): Promise<Task> {
  try {
    const tasks = await getTasks();
    const index = tasks.findIndex((t) => t.id === task.id);

    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }

    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
    return task;
  } catch (error: unknown) {
    console.error("Error saving task:", {
      error,
      task,
      TASKS_FILE,
      writePermission: await fs
        .access(TASKS_FILE, fs.constants.W_OK)
        .then(() => true)
        .catch(() => false),
    });
    if (error instanceof Error) {
      throw new Error(`Failed to save task: ${error.message}`);
    }
    throw new Error("Failed to save task");
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  await fs.writeFile(TASKS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

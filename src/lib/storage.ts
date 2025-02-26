import { promises as fs } from "fs";
import path from "path";
import { Project, Task } from "@/app/projects/[id]/types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

// Initialize storage
async function initStorage() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR);
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
  } catch {
    return [];
  }
}

export async function getTask(id: string): Promise<Task | null> {
  const tasks = await getTasks();
  return tasks.find((t) => t.id === id) || null;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const tasks = await getTasks();
  return tasks.filter((t) => t.projectId === projectId);
}

export async function saveTask(task: Task): Promise<Task> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === task.id);

  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.push(task);
  }

  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  return task;
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  await fs.writeFile(TASKS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

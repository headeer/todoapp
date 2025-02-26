import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  priority: "low" | "medium" | "high";
  checklistItems: ChecklistItem[];
}

const dataFilePath = path.join(process.cwd(), "data", "tasks.json");

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Initialize tasks.json if it doesn't exist
async function initializeTasksFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    // Create with mock data initially
    const mockTasks: Task[] = [
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
    ];
    await fs.writeFile(dataFilePath, JSON.stringify(mockTasks, null, 2));
  }
}

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    await ensureDataDirectory();
    await initializeTasksFile();

    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const tasks = JSON.parse(fileContent);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    await ensureDataDirectory();
    await initializeTasksFile();

    const newTask = await request.json();
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const tasks = JSON.parse(fileContent);

    tasks.push(newTask);
    await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2));

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: Request) {
  try {
    await ensureDataDirectory();
    await initializeTasksFile();

    const updatedTask = await request.json();
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    let tasks = JSON.parse(fileContent);

    tasks = tasks.map((task: Task) =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    );

    await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2));
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

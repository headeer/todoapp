import { NextResponse } from "next/server";
import { getTasks, saveTask, deleteTask } from "@/lib/storage";

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

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const tasks = await getTasks();
    return new NextResponse(JSON.stringify(tasks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch tasks" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const task = await request.json();
    const savedTask = await saveTask(task);
    return new NextResponse(JSON.stringify(savedTask), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create task" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: Request) {
  try {
    const task = await request.json();
    console.log("Received task update request:", {
      task,
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });

    const updatedTask = await saveTask(task);
    console.log("Task updated successfully:", updatedTask);

    return new NextResponse(JSON.stringify(updatedTask), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating task:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      task: await request.json().catch(() => ({})),
      method: request.method,
      url: request.url,
    });

    return new NextResponse(
      JSON.stringify({
        error: "Failed to update task",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteTask(id);
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete task" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

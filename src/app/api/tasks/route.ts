import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  throw lastError;
}

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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // If no projectId provided, return all tasks
    const tasks = await withRetry(() =>
      prisma.task.findMany({
        where: projectId ? { projectId } : undefined,
        include: { checklistItems: true },
      })
    );

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
    const body = await request.json();

    const task = await withRetry(() =>
      prisma.task.create({
        data: {
          title: body.title,
          description: body.description || "",
          status: body.status || "TODO",
          priority: body.priority || "MEDIUM",
          projectId: body.projectId,
          plannedDate: body.plannedDate ? new Date(body.plannedDate) : null,
          checklistItems: body.checklistItems
            ? {
                create: body.checklistItems.map((item: ChecklistItem) => ({
                  title: item.text,
                  completed: item.completed || false,
                })),
              }
            : undefined,
        },
        include: {
          checklistItems: true,
        },
      })
    );

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, checklistItems, ...taskData } = body;

    const task = await withRetry(async () => {
      // First, update the task
      const updatedTask = await prisma.task.update({
        where: { id },
        data: taskData,
      });

      // Then, update checklist items
      if (checklistItems) {
        // Delete existing checklist items
        await prisma.checklistItem.deleteMany({
          where: { taskId: id },
        });

        // Create new checklist items
        await prisma.checklistItem.createMany({
          data: checklistItems.map((item: any) => ({
            ...item,
            taskId: id,
          })),
        });
      }

      // Return the updated task with checklist items
      return prisma.task.findUnique({
        where: { id },
        include: { checklistItems: true },
      });
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks - Delete a task (using query parameter)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required as a query parameter" },
        { status: 400 }
      );
    }

    await withRetry(async () => {
      // First delete checklist items
      await prisma.checklistItem.deleteMany({
        where: { taskId },
      });

      // Then delete the task
      await prisma.task.delete({
        where: { id: taskId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

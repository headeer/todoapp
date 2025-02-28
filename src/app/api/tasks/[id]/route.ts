import { NextResponse } from "next/server";
import { getTask, saveTask, deleteTask } from "@/lib/storage";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const prismaClient = new PrismaClient();

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await getTask(params.id);
    if (!task) {
      return new NextResponse(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify(task), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch task" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const task = await saveTask({ ...body, id: params.id });

    return new NextResponse(JSON.stringify(task), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update task" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

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

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
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

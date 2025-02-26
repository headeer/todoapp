import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Params {
  params: {
    id: string;
  };
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        checklistItems: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, status, checklistItems } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // First update the task
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description: description || "",
        status: status || "TODO",
      },
    });

    // Handle checklist items if provided
    if (checklistItems && Array.isArray(checklistItems)) {
      // Delete existing checklist items
      await prisma.checklistItem.deleteMany({
        where: { taskId: id },
      });

      // Create new checklist items
      for (const item of checklistItems) {
        await prisma.checklistItem.create({
          data: {
            text: item.text,
            completed: item.completed || false,
            taskId: id,
          },
        });
      }
    }

    // Get the updated task with checklist items
    const updatedTask = await prisma.task.findUnique({
      where: { id },
      include: {
        checklistItems: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;

    await prisma.task.delete({
      where: { id },
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

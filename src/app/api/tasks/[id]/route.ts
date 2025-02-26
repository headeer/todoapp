import { NextResponse } from "next/server";
import { getTask, saveTask, deleteTask } from "@/lib/storage";

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

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTask(params.id);
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

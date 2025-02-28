import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getProject, saveProject, deleteProject } from "@/lib/storage";
import prisma from "@/lib/prisma";

// Add route segment config
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface Project {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  isMain: boolean;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount?: number;
}

const dataFilePath = path.join(process.cwd(), "data", "projects.json");

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Initialize projects.json if it doesn't exist
async function initializeProjectsFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    // Create with mock data initially
    const mockProjects: Project[] = [
      {
        id: "project-1",
        name: "Website Redesign",
        description: "Redesign company website with new branding",
        viewed: true,
        isMain: true,
        logo: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "project-2",
        name: "Mobile App Development",
        description: "Create a new mobile app for customers",
        viewed: false,
        isMain: false,
        logo: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "project-3",
        name: "Marketing Campaign",
        description: "Q2 marketing campaign planning and execution",
        viewed: true,
        isMain: false,
        logo: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await fs.writeFile(dataFilePath, JSON.stringify(mockProjects, null, 2));
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const formattedProject: Project = {
      ...project,
      description: project.description || "",
      logo: project.logo || "/default-logo.png",
      taskCount: project._count.tasks,
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const project = await saveProject({ ...body, id: params.id });

    return new NextResponse(JSON.stringify(project), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update project" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteProject(params.id);
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete project" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

import { NextResponse } from "next/server";
import { getProjects, saveProject } from "@/lib/storage";
import prisma from "@/lib/prisma";

interface Project {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  isMain: boolean;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount?: number;
}

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    const formattedProjects: Project[] = projects.map((project) => ({
      ...project,
      description: project.description || "",
      logo: project.logo || "/default-logo.png",
      taskCount: project._count.tasks,
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const projectData = await request.json();

    // Create the project directly with Prisma
    const savedProject = await prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description || "",
        viewed: false,
        isMain: false,
        logo: projectData.logo || "/default-logo.png",
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    const formattedProject = {
      ...savedProject,
      description: savedProject.description || "",
      logo: savedProject.logo || "/default-logo.png",
      taskCount: savedProject._count.tasks,
    };

    return NextResponse.json(formattedProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

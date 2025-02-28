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
    const project = await request.json();
    const savedProject = await saveProject(project);
    return new NextResponse(JSON.stringify(savedProject), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create project" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

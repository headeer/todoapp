import { NextResponse } from "next/server";
import { getProjects, saveProject } from "@/lib/storage";

interface Project {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  isMain: boolean;
  logo: string;
}

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await getProjects();
    return new NextResponse(JSON.stringify(projects), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch projects" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
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

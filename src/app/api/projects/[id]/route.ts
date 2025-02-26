import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface Project {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  isMain: boolean;
  logo?: string;
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
      },
      {
        id: "project-2",
        name: "Mobile App Development",
        description: "Create a new mobile app for customers",
        viewed: false,
        isMain: false,
        logo: "",
      },
      {
        id: "project-3",
        name: "Marketing Campaign",
        description: "Q2 marketing campaign planning and execution",
        viewed: true,
        isMain: false,
        logo: "",
      },
    ];
    await fs.writeFile(dataFilePath, JSON.stringify(mockProjects, null, 2));
  }
}

interface Params {
  params: {
    id: string;
  };
}

// GET /api/projects/[id] - Get a specific project
export async function GET(request: Request, { params }: Params) {
  try {
    await ensureDataDirectory();
    await initializeProjectsFile();

    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const projects = JSON.parse(fileContent) as Project[];
    const project = projects.find((p) => p.id === params.id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: Request, { params }: Params) {
  try {
    await ensureDataDirectory();
    await initializeProjectsFile();

    const updatedProject = await request.json();
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    let projects = JSON.parse(fileContent) as Project[];

    projects = projects.map((p) =>
      p.id === params.id ? { ...p, ...updatedProject } : p
    );

    await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2));
    const project = projects.find((p) => p.id === params.id);
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: Request, { params }: Params) {
  try {
    await ensureDataDirectory();
    await initializeProjectsFile();

    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    let projects = JSON.parse(fileContent) as Project[];

    projects = projects.filter((p) => p.id !== params.id);
    await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

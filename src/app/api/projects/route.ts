import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface Project {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  isMain: boolean;
  logo: string;
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

// GET /api/projects - Get all projects
export async function GET() {
  try {
    await ensureDataDirectory();
    await initializeProjectsFile();

    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const projects = JSON.parse(fileContent);
    return NextResponse.json(projects);
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
    await ensureDataDirectory();
    await initializeProjectsFile();

    const newProject = await request.json();
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const projects = JSON.parse(fileContent);

    projects.push(newProject);
    await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2));

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

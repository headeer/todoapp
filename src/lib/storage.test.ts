import { PrismaClient } from "@prisma/client";
import {
  getProjects,
  getProject,
  saveProject,
  deleteProject,
  getTasks,
  getTask,
  saveTask,
  deleteTask,
} from "./storage";
import {
  Project,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/app/projects/[id]/types";

// Mock PrismaClient
jest.mock("./prisma", () => {
  const mockPrismaClient = {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    checklistItem: {
      deleteMany: jest.fn(),
    },
  };
  return { __esModule: true, default: mockPrismaClient };
});

// Import the mocked prisma instance
import prisma from "./prisma";

describe("Storage Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default count to avoid initialization
    (prisma.project.count as jest.Mock).mockResolvedValue(1);
  });

  describe("Project Operations", () => {
    const mockProject: Project = {
      id: "test-project-1",
      name: "Test Project",
      description: "Test Description",
      logo: "/test-logo.png",
      isMain: false,
      viewed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("getProjects returns formatted projects", async () => {
      const mockPrismaProjects = [
        {
          ...mockProject,
          _count: { tasks: 5 },
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(
        mockPrismaProjects
      );

      const result = await getProjects();
      expect(result[0]).toEqual(
        expect.objectContaining({
          ...mockProject,
          taskCount: 5,
        })
      );
    });

    it("saveProject handles project creation correctly", async () => {
      const mockUpsertResult = {
        ...mockProject,
        _count: { tasks: 0 },
      };

      (prisma.project.upsert as jest.Mock).mockResolvedValue(mockUpsertResult);

      const result = await saveProject(mockProject);
      expect(result).toEqual(
        expect.objectContaining({
          ...mockProject,
          taskCount: 0,
        })
      );
    });

    it("deleteProject deletes project successfully", async () => {
      (prisma.project.delete as jest.Mock).mockResolvedValue(mockProject);

      const result = await deleteProject(mockProject.id);
      expect(result).toBe(true);
      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: mockProject.id },
      });
    });
  });

  describe("Task Operations", () => {
    const mockTask: Task = {
      id: "test-task-1",
      title: "Test Task",
      description: "Test Description",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      projectId: "test-project-1",
      checklistItems: [],
      plannedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPrismaTask = {
      id: mockTask.id,
      title: mockTask.title,
      description: mockTask.description,
      status: mockTask.status,
      priority: mockTask.priority,
      projectId: mockTask.projectId,
      plannedDate: mockTask.plannedDate,
      createdAt: mockTask.createdAt,
      updatedAt: mockTask.updatedAt,
      checklistItems: [],
    };

    it("getTasks returns formatted tasks", async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([mockPrismaTask]);

      const result = await getTasks();
      expect(result[0]).toEqual(expect.objectContaining(mockTask));
    });

    it("saveTask handles task creation correctly", async () => {
      const { id, ...newTask } = mockTask;
      (prisma.task.create as jest.Mock).mockResolvedValue(mockPrismaTask);

      const result = await saveTask(newTask);
      expect(result).toEqual(expect.objectContaining(mockTask));
    });

    it("saveTask handles task update correctly", async () => {
      const updatedTask = { ...mockTask, title: "Updated Title" };
      const updatedPrismaTask = { ...mockPrismaTask, title: "Updated Title" };

      (prisma.task.update as jest.Mock).mockResolvedValue(updatedPrismaTask);

      const result = await saveTask(updatedTask);
      expect(result).toEqual(expect.objectContaining(updatedTask));
    });

    it("deleteTask deletes task successfully", async () => {
      (prisma.checklistItem.deleteMany as jest.Mock).mockResolvedValue({
        count: 0,
      });
      (prisma.task.delete as jest.Mock).mockResolvedValue(mockPrismaTask);

      await deleteTask(mockTask.id);
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: mockTask.id },
      });
    });
  });
});

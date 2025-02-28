"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyStateIllustration } from "@/components/Illustrations";
import StatusIcon from "@/components/StatusIcon";
import Loader from "@/components/Loader";
import { Project, Task } from "@/types";
import { generateId } from "@/utils";
import { useRouter } from "next/navigation";

// Helper function to format dates
function formatDate(dateInput: string | number | Date | undefined | null) {
  try {
    // Return empty string if no date provided
    if (!dateInput) return "";

    // If it's already a Date object
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return "";
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(dateInput);
    }

    // Try to create a valid date from the input
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    logo: "",
  });
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load projects
        const projectsResponse = await fetch("/api/projects");
        if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);

        // Load tasks - only if we're in a project context
        if (window.location.pathname.includes("/projects/")) {
          const tasksResponse = await fetch("/api/tasks");
          if (!tasksResponse.ok) throw new Error("Failed to fetch tasks");
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get task counts by status
  const getTaskCountByStatus = (
    projectId: string,
    status: "TODO" | "IN_PROGRESS" | "DONE"
  ) => {
    return tasks.filter(
      (task: Task) => task.projectId === projectId && task.status === status
    ).length;
  };

  const handleCreateProject = async () => {
    const projectId = generateId("project");
    const now = new Date();
    const project = {
      id: projectId,
      name: newProject.name,
      description: newProject.description,
      viewed: true,
      isMain: false,
      logo: newProject.logo,
      createdAt: now,
      updatedAt: now,
      taskCount: 0,
    };

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      setProjects([...projects, project]);
      setNewProject({ name: "", description: "", logo: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const setMainProject = async (projectId: string) => {
    const updatedProjects = projects.map((project) => ({
      ...project,
      isMain: project.id === projectId,
    }));

    try {
      // Update all projects to reflect the new main status
      await Promise.all(
        updatedProjects.map((project) =>
          fetch(`/api/projects/${project.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(project),
          })
        )
      );

      setProjects(updatedProjects);
    } catch (error) {
      console.error("Error updating main project:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Remove the project from the local state
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingProject),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      setProjects(
        projects.map((p) => (p.id === editingProject.id ? editingProject : p))
      );
      setEditingProject(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const addTask = async (taskData: any) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error("Failed to add task");

      const newTask = await response.json();
      // Use the returned task (which includes the generated ID) to update your UI
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Flowlist
        </h1>
        <p className="text-xl text-emerald-400 max-w-2xl mx-auto font-medium">
          The only todo app you&apos;ll ever need
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">My Projects</h2>
        {projects.length > 0 && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <EmptyStateIllustration />
          <h2 className="text-2xl font-semibold text-white mb-4">
            No projects yet
          </h2>
          <p className="text-gray-300 mb-8">
            Create your first project to get started
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group block h-full relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openEditModal(project, e);
                  }}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Edit project"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600 dark:text-gray-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      confirm("Are you sure you want to delete this project?")
                    ) {
                      handleDeleteProject(project.id);
                    }
                  }}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  title="Delete project"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <Link href={`/projects/${project.id}`} className="block h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {project.name}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {project.taskCount || 0} tasks
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => {
                setIsModalOpen(false);
                setEditingProject(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-indigo-900">
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-800 font-bold mb-2">
                    Project Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {editingProject?.logo || newProject.logo ? (
                      <div className="relative">
                        <Image
                          src={editingProject?.logo || newProject.logo}
                          alt="Project logo"
                          width={64}
                          height={64}
                          className="rounded-lg object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingProject) {
                              setEditingProject({
                                ...editingProject,
                                logo: "",
                              });
                            } else {
                              setNewProject({ ...newProject, logo: "" });
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <label className="cursor-pointer w-full h-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-indigo-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  if (editingProject) {
                                    setEditingProject({
                                      ...editingProject,
                                      logo: e.target?.result as string,
                                    });
                                  } else {
                                    setNewProject({
                                      ...newProject,
                                      logo: e.target?.result as string,
                                    });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Upload a logo for your project. Recommended size:
                        64x64px
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-800 font-bold mb-2"
                    htmlFor="name"
                  >
                    Project Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input w-full bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Enter project name"
                    value={
                      editingProject ? editingProject.name : newProject.name
                    }
                    onChange={(e) => {
                      if (editingProject) {
                        setEditingProject({
                          ...editingProject,
                          name: e.target.value,
                        });
                      } else {
                        setNewProject({ ...newProject, name: e.target.value });
                      }
                    }}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-800 font-bold mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="input w-full h-24 bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Enter project description"
                    value={
                      editingProject
                        ? editingProject.description
                        : newProject.description
                    }
                    onChange={(e) => {
                      if (editingProject) {
                        setEditingProject({
                          ...editingProject,
                          description: e.target.value,
                        });
                      } else {
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      if (editingProject) {
                        handleEditProject(e);
                      } else {
                        handleCreateProject();
                      }
                    }}
                    disabled={
                      editingProject ? !editingProject.name : !newProject.name
                    }
                  >
                    {editingProject ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

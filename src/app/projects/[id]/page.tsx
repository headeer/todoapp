"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ClientOnly from "@/components/ClientOnly";
import StatusIcon from "@/components/StatusIcon";
import Loader from "@/components/Loader";
import {
  Task,
  TaskStatus,
  TaskPriority,
  ChecklistItem,
  Project,
  TaskData,
  validateTaskStatus,
  validateTaskPriority,
  mapTaskDataToTask,
  createNewTask,
  createNewChecklistItem,
} from "./types";
import TaskModal from "@/components/TaskModal";
import ChecklistSection from "@/components/ChecklistSection";

// Generate unique IDs using a counter to ensure consistency
let idCounter = 0;
const generateId = (prefix: string, projectId: string) => {
  idCounter += 1;
  return `${projectId}-${prefix}-${idCounter}`;
};

// Sortable task item component
function SortableTaskItem({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedItems = task.checklistItems.filter(
    (item) => item.completed
  ).length;
  const totalItems = task.checklistItems.length;
  const progress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-emerald-400 text-lg hover:text-emerald-300">
          {task.title}
        </h4>
        <div className="flex items-center space-x-2">
          <StatusIcon status={task.status} size="sm" />
          <span
            className={`priority-badge priority-${task.priority || "medium"}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      {totalItems > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                progress === 100
                  ? "bg-emerald-500"
                  : progress > 50
                  ? "bg-blue-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>
              {completedItems} of {totalItems} tasks completed
            </span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Column component
function TaskColumn({
  title,
  tasks,
  status,
  onTaskClick,
}: {
  title: string;
  tasks: Task[];
  status: "TODO" | "IN_PROGRESS" | "DONE";
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="task-column">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <StatusIcon status={status} size="md" />
          <h3 className="text-xl font-bold text-emerald-400 ml-2">{title}</h3>
        </div>
        <span className="bg-gray-800 text-emerald-400 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] p-2 rounded-lg transition-colors duration-200 ${
          isOver
            ? "bg-emerald-900/30 border-2 border-emerald-500/50"
            : "bg-gray-800/30 border-2 border-transparent"
        }`}
        id={status}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div
            className={`h-full min-h-[150px] flex items-center justify-center border-2 border-dashed rounded-lg transition-colors duration-200 ${
              isOver
                ? "border-emerald-500 bg-emerald-900/20"
                : "border-gray-600 bg-gray-800/20"
            }`}
          >
            <p className="text-emerald-400/70 text-sm">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Task>(() => createNewTask(projectId));
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadProjectAndTasks = async () => {
      setIsLoading(true);
      try {
        // Load project
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (!projectResponse.ok) throw new Error("Failed to fetch project");
        const projectData = await projectResponse.json();
        setProject(projectData);

        // Load tasks
        const fetchTasks = async () => {
          try {
            const response = await fetch(`/api/tasks?projectId=${projectId}`);
            if (!response.ok) {
              throw new Error("Failed to fetch tasks");
            }
            const data: TaskData[] = await response.json();
            const mappedTasks = data.map(mapTaskDataToTask);
            setTasks(mappedTasks);
          } catch (error) {
            console.error("Error fetching tasks:", error);
          }
        };

        await fetchTasks();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadProjectAndTasks();
    }
  }, [projectId]);

  const createTask = async (task: Task) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }
    return response.json();
  };

  const handleAddNewChecklistItem = () => {
    const newItem = createNewChecklistItem(newTask.id);
    setNewTask({
      ...newTask,
      checklistItems: [...newTask.checklistItems, newItem],
    });
  };

  const handleChecklistItemChange = (
    taskId: string,
    itemId: string,
    text: string,
    completed?: boolean
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedItems = task.checklistItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            text,
            title: text,
            completed: completed !== undefined ? completed : item.completed,
            updatedAt: new Date(),
          }
        : item
    );

    const updatedTask: Task = {
      ...task,
      checklistItems: updatedItems,
      updatedAt: new Date(),
    };

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
    );

    if (selectedTask?.id === taskId) {
      setSelectedTask(updatedTask);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const updatedTask = tasks.find((task) => task.id === taskId);
    if (!updatedTask) return;

    const task: Task = {
      ...updatedTask,
      status: newStatus,
      updatedAt: new Date(),
    };

    setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? task : t)));
  };

  const handlePriorityChange = (taskId: string, newPriority: TaskPriority) => {
    const updatedTask = tasks.find((task) => task.id === taskId);
    if (!updatedTask) return;

    const task: Task = {
      ...updatedTask,
      priority: newPriority,
      updatedAt: new Date(),
    };

    setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? task : t)));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask(newTask);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setNewTask(createNewTask(projectId));
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    const targetStatus = ["TODO", "IN_PROGRESS", "DONE"].includes(
      overId as string
    )
      ? (overId as TaskStatus)
      : tasks.find((task) => task.id === overId)?.status;

    if (targetStatus && activeTask.status !== targetStatus) {
      // Optimistically update the UI
      const updatedTasks = tasks.map((task) =>
        task.id === activeId
          ? { ...task, status: targetStatus as TaskStatus }
          : task
      );
      setTasks(updatedTasks);

      // Update the task in the database
      try {
        const updatedTask = { ...activeTask, status: targetStatus };
        const response = await fetch("/api/tasks", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }
      } catch (error) {
        console.error("Error updating task:", error);
        // Revert the UI if the update fails
        setTasks(tasks);
      }
    }
    setActiveTask(null);
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleToggleChecklistItem = (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const item = task.checklistItems.find((i) => i.id === itemId);
    if (!item) return;

    handleChecklistItemChange(taskId, itemId, item.text, !item.completed);
  };

  const handleTaskStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTask) return;
    const newStatus = e.target.value;
    if (!validateTaskStatus(newStatus)) return;
    handleStatusChange(selectedTask.id, newStatus as TaskStatus);
  };

  const handleTaskPriorityChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!selectedTask) return;
    const newPriority = e.target.value;
    if (!validateTaskPriority(newPriority)) return;
    handlePriorityChange(selectedTask.id, newPriority as TaskPriority);
  };

  if (!project || isLoading) {
    return <Loader />;
  }

  const todoTasks = tasks.filter((task) => task.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  );
  const doneTasks = tasks.filter((task) => task.status === TaskStatus.DONE);

  const statusOptions = [
    { value: TaskStatus.TODO, label: "To Do" },
    { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
    { value: TaskStatus.DONE, label: "Done" },
  ];

  const priorityOptions = [
    { value: TaskPriority.HIGH, label: "High" },
    { value: TaskPriority.MEDIUM, label: "Medium" },
    { value: TaskPriority.LOW, label: "Low" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
      <div className="flex items-center mb-8">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 mr-4">
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <div className="flex items-center gap-4">
          {project.logo ? (
            <Image
              src={project.logo}
              alt={project.name}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center">
              <span className="text-xl font-bold text-emerald-200">
                {project.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-emerald-400">
            {project.name}
          </h1>
        </div>
      </div>

      <p className="text-gray-400 mb-8 text-lg">{project.description}</p>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-emerald-400">Tasks</h2>
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          className="btn-primary"
        >
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
          Add Task
        </button>
      </div>

      <ClientOnly>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <TaskColumn
                title="To Do"
                tasks={todoTasks}
                status="TODO"
                onTaskClick={openTaskDetail}
              />
            </div>

            <div>
              <TaskColumn
                title="In Progress"
                tasks={inProgressTasks}
                status="IN_PROGRESS"
                onTaskClick={openTaskDetail}
              />
            </div>

            <div>
              <TaskColumn
                title="Done"
                tasks={doneTasks}
                status="DONE"
                onTaskClick={openTaskDetail}
              />
            </div>
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="bg-gray-900/90 backdrop-blur-sm border border-emerald-500/50 rounded-lg p-4 shadow-lg w-[calc(100%-1rem)]">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-emerald-400 text-lg">
                    {activeTask.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <StatusIcon status={activeTask.status} size="sm" />
                    <span
                      className={`priority-badge priority-${activeTask.priority}`}
                    >
                      {activeTask.priority.charAt(0).toUpperCase() +
                        activeTask.priority.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {activeTask.description}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ClientOnly>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            task={selectedTask || undefined}
            projectId={project.id}
            onSave={(updatedTask) => {
              if (updatedTask.id) {
                // Update existing task
                setTasks((prevTasks) =>
                  prevTasks.map((t) =>
                    t.id === updatedTask.id ? updatedTask : t
                  )
                );

                // Save to API
                fetch("/api/tasks", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(updatedTask),
                }).catch((error) => {
                  console.error("Error updating task:", error);
                });
              } else {
                // Create new task with a temporary ID
                const newTaskWithId = {
                  ...updatedTask,
                  id: `temp-${Date.now()}`,
                };

                setTasks((prevTasks) => [...prevTasks, newTaskWithId]);

                // Save to API
                createTask(updatedTask).catch((error) => {
                  console.error("Error creating task:", error);
                });
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
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
    text: string
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedItems = task.checklistItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            text,
            title: text,
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
    setIsTaskDetailModalOpen(true);
  };

  const handleToggleChecklistItem = (taskId: string, itemId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedItems = task.checklistItems.map((item) => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        return { ...task, checklistItems: updatedItems };
      }
      return task;
    });

    setTasks(updatedTasks);
    if (selectedTask?.id === taskId) {
      setSelectedTask(updatedTasks.find((t) => t.id === taskId) || null);
    }
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks(
        tasks.map((task) => (task.id === selectedTask.id ? selectedTask : task))
      );
      setIsTaskDetailModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
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
    return <Loader message="Loading project details..." />;
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
          onClick={() => setIsTaskModalOpen(true)}
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsTaskModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-black">
                  Create New Task
                </h2>
                  <button
                    onClick={() => setIsTaskModalOpen(false)}
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
                <div className="mb-4">
                  <label
                    className="block text-black font-bold mb-2"
                    htmlFor="title"
                  >
                    Task Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-black font-bold mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 bg-white text-black"
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-black font-bold mb-2"
                    htmlFor="status"
                  >
                    Initial Status
                  </label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black"
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                  >
                    <option value={TaskStatus.TODO}>To Do</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.DONE}>Done</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    className="block text-black font-bold mb-2"
                    htmlFor="priority"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black"
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                  </select>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-black font-bold">
                      Checklist Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddNewChecklistItem}
                      className="text-purple-700 hover:text-purple-900 text-sm font-bold"
                    >
                      + Add Item
                    </button>
                  </div>
                  {newTask.checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleChecklistItemChange(
                            newTask.id,
                            item.id,
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Add checklist item"
                      />
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-end space-x-3">
                  <button
                      className="px-4 py-2 rounded-lg text-black border border-gray-300 hover:bg-gray-100 transition-colors font-medium"
                    onClick={() => setIsTaskModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    onClick={handleCreateTask}
                    disabled={!newTask.title}
                  >
                    Create Task
                  </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {isTaskDetailModalOpen && selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => {
                // Check if task has been edited
                const originalTask = tasks.find(
                  (t) => t.id === selectedTask.id
                );
                const isEdited =
                  JSON.stringify(originalTask) !== JSON.stringify(selectedTask);

                if (isEdited) {
                  if (
                    confirm(
                      "You have unsaved changes. Are you sure you want to close?"
                    )
                  ) {
                    setIsTaskDetailModalOpen(false);
                  }
                } else {
                  setIsTaskDetailModalOpen(false);
                }
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-black">
                  <input
                    type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black"
                    value={selectedTask.title}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        title: e.target.value,
                      })
                    }
                  />
                </h2>
                  <button
                    onClick={() => {
                      // Check if task has been edited
                      const originalTask = tasks.find(
                        (t) => t.id === selectedTask.id
                      );
                      const isEdited =
                        JSON.stringify(originalTask) !==
                        JSON.stringify(selectedTask);

                      if (isEdited) {
                        if (
                          confirm(
                            "You have unsaved changes. Are you sure you want to close?"
                          )
                        ) {
                          setIsTaskDetailModalOpen(false);
                        }
                      } else {
                        setIsTaskDetailModalOpen(false);
                      }
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
                <div className="mb-4">
                  <label className="block text-black font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 bg-white text-black"
                    value={selectedTask.description}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-black font-bold mb-2">
                    Status
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={handleTaskStatusChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  >
                    <option value={TaskStatus.TODO}>To Do</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.DONE}>Done</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-black font-bold mb-2">
                    Priority
                  </label>
                  <select
                    value={selectedTask.priority}
                    onChange={handleTaskPriorityChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  >
                    <option value={TaskPriority.HIGH}>High</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.LOW}>Low</option>
                  </select>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-black font-bold">
                      Checklist
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask({
                          ...selectedTask,
                          checklistItems: [
                            ...selectedTask.checklistItems,
                            createNewChecklistItem(selectedTask.id),
                          ],
                        });
                      }}
                      className="text-purple-700 hover:text-purple-900 text-sm font-bold"
                    >
                      + Add Item
                    </button>
                  </div>

                  {/* Progress bar for checklist */}
                  {selectedTask.checklistItems.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-black font-medium mb-1">
                        <span>Overall Progress</span>
                        <span>
                          {
                            selectedTask.checklistItems.filter(
                              (item) => item.completed
                            ).length
                          }{" "}
                          / {selectedTask.checklistItems.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{
                            width: `${
                              selectedTask.checklistItems.length > 0
                                ? (selectedTask.checklistItems.filter(
                                    (item) => item.completed
                                  ).length /
                                    selectedTask.checklistItems.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {selectedTask.checklistItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center mb-2 p-3 rounded-lg"
                    >
                      <label className="custom-checkbox mr-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) =>
                            handleChecklistItemChange(
                              selectedTask.id,
                              item.id,
                              e.target.checked ? item.text : ""
                            )
                          }
                        />
                        <div className="checkbox-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </label>
                        <input
                          type="text"
                        className={`flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2 ${
                          item.completed
                            ? "line-through text-gray-500"
                            : "text-black"
                        }`}
                          value={item.text}
                        onChange={(e) =>
                          handleChecklistItemChange(
                            selectedTask.id,
                            item.id,
                            e.target.value
                          )
                        }
                        />
                        <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedItems =
                            selectedTask.checklistItems.filter(
                              (_, i) => i !== index
                            );
                            setSelectedTask({
                              ...selectedTask,
                            checklistItems: updatedItems,
                            });
                          }}
                        className="text-red-500 hover:text-red-700 p-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                  ))}
                </div>
                <div className="border-t border-gray-300 pt-4 mt-6">
                <div className="flex justify-end space-x-3">
                  <button
                      className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors font-medium"
                    onClick={() => setIsTaskDetailModalOpen(false)}
                  >
                    Cancel
                  </button>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      onClick={handleSaveTask}
                    >
                    Save Changes
                  </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Task,
  TaskStatus,
  TaskPriority,
  ChecklistItem as ChecklistItemType,
} from "@/app/projects/[id]/types";
import ChecklistSection from "./ChecklistSection";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  projectId: string;
  onSave: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  projectId,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemType[]>([]);
  const [plannedDate, setPlannedDate] = useState<string>("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setChecklistItems(task.checklistItems || []);
      setPlannedDate(
        task.plannedDate ? formatDateForInput(task.plannedDate) : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setStatus(TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
      setChecklistItems([]);
      setPlannedDate("");
    }
  }, [task, isOpen]);

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const updatedTask: Task = {
      id: task?.id || "",
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId,
      checklistItems,
      plannedDate: plannedDate ? new Date(plannedDate) : null,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(updatedTask);
    onClose();
  };

  const handleChecklistUpdate = (updatedItems: ChecklistItemType[]) => {
    setChecklistItems(updatedItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
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

        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 ease-in-out text-gray-800 placeholder-gray-400 hover:border-gray-300"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 ease-in-out text-gray-800 placeholder-gray-400 hover:border-gray-300 resize-none"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label
              htmlFor="plannedDate"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Planned Date
            </label>
            <input
              type="date"
              id="plannedDate"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 ease-in-out text-gray-800 hover:border-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 ease-in-out text-gray-800 hover:border-gray-300 appearance-none cursor-pointer"
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 ease-in-out text-gray-800 hover:border-gray-300 appearance-none cursor-pointer"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>
          </div>

          <ChecklistSection
            items={checklistItems}
            taskId={task?.id || ""}
            onUpdate={handleChecklistUpdate}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

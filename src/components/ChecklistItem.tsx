"use client";

import React, { useState, useEffect } from "react";
import { ChecklistItem as ChecklistItemType } from "@/app/projects/[id]/types";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onUpdate: (item: ChecklistItemType) => void;
  onDelete?: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [completed, setCompleted] = useState(item.completed);

  // Update local state when item prop changes
  useEffect(() => {
    setText(item.text);
    setCompleted(item.completed);
  }, [item]);

  const handleCheckboxChange = () => {
    const updatedCompleted = !completed;
    setCompleted(updatedCompleted);

    // Immediately update the parent component
    onUpdate({
      ...item,
      completed: updatedCompleted,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleSave = () => {
    if (text.trim()) {
      onUpdate({
        ...item,
        text,
        title: text, // Ensure both text and title are updated
        completed,
      });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setText(item.text);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 py-1 group">
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={completed}
          onChange={handleCheckboxChange}
          className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
      </div>

      {isEditing ? (
        <div className="flex-grow flex">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="flex-grow border-b border-emerald-500 bg-transparent px-1 py-0.5 text-sm text-gray-800 focus:outline-none"
          />
        </div>
      ) : (
        <div
          className={`flex-grow cursor-pointer text-sm ${
            completed ? "line-through text-gray-500" : "text-gray-800"
          }`}
          onClick={() => setIsEditing(true)}
        >
          {text}
        </div>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
          aria-label="Delete item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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
      )}
    </div>
  );
};

export default ChecklistItem;

"use client";

import React, { useState } from "react";
import { ChecklistItem as ChecklistItemType } from "@/app/projects/[id]/types";
import { ChecklistItem } from "./ChecklistItem";
import { v4 as uuidv4 } from "uuid";

interface ChecklistSectionProps {
  items: ChecklistItemType[];
  taskId: string;
  onUpdate: (items: ChecklistItemType[]) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  items,
  taskId,
  onUpdate,
}) => {
  const [newItemText, setNewItemText] = useState("");

  const handleItemUpdate = (updatedItem: ChecklistItemType) => {
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    onUpdate(updatedItems);
  };

  const handleItemDelete = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onUpdate(updatedItems);
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItemType = {
        id: uuidv4(),
        text: newItemText.trim(),
        title: newItemText.trim(),
        completed: false,
        taskId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onUpdate([...items, newItem]);
      setNewItemText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Checklist</h3>

      <div className="space-y-1">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onUpdate={handleItemUpdate}
            onDelete={handleItemDelete}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add new item..."
          className="flex-grow border-b border-gray-300 bg-transparent px-1 py-1 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={handleAddItem}
          disabled={!newItemText.trim()}
          className="ml-2 rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ChecklistSection;

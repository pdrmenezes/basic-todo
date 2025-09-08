import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Todo, DayOfWeek } from "../types";
import { SortableTodoItem } from "./SortableTodoItem";

interface DayColumnProps {
  day: DayOfWeek;
  label: string;
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string, day: DayOfWeek) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  day,
  label,
  todos,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [newTodoText, setNewTodoText] = useState("");

  const { setNodeRef } = useDroppable({
    id: day,
  });

  const handleLineClick = (lineIndex: number) => {
    setEditingLine(lineIndex);
    setNewTodoText("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAdd(newTodoText.trim(), day);
      setNewTodoText("");
    }
    setEditingLine(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    } else if (e.key === "Escape") {
      setEditingLine(null);
      setNewTodoText("");
    }
  };

  const totalSpaces = 15;
  const emptySpaces = Array.from(
    { length: totalSpaces - todos.length },
    (_, i) => i
  );

  return (
    <div className="day-column" ref={setNodeRef}>
      <h3 className="day-header">{label}</h3>
      <div className="todos-container">
        <SortableContext
          items={todos.map((todo) => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {emptySpaces.map((spaceIndex) => (
          <div key={spaceIndex}>
            {editingLine === spaceIndex ? (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSubmit}
                  className="add-todo-input"
                  autoFocus
                />
              </form>
            ) : (
              <div
                className="clickable-space"
                onClick={() => handleLineClick(spaceIndex)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

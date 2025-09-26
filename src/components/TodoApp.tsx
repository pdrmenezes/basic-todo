import { UserButton } from "@clerk/clerk-react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { DAYS_OF_WEEK } from "../constants/days";
import { useAuth } from "../contexts/AuthContext";
import { useTodos } from "../hooks/useTodos";
import type { DayOfWeek } from "../types";
import { DayColumn } from "./DayColumn";
import { SortableTodoItem } from "./SortableTodoItem";

export function TodoApp() {
  const [activeTodo, setActiveTodo] = useState<any>(null);

  const { loading: authLoading, error: authError } = useAuth();
  const {
    todos,
    loading: todosLoading,
    error: todosError,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    updateTodoDay,
    getTodosForDay,
  } = useTodos();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (authLoading || todosLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>basic todo</h1>
          <UserButton />
        </header>
        <div className="loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (authError || todosError) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>basic todo</h1>
          <UserButton />
        </header>
        <div className="error-state">
          <h2>Something went wrong</h2>
          <p>{authError || todosError}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = todos.find((t) => t.id === active.id);
    setActiveTodo(todo || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;

    const activeTodo = todos.find((t) => t.id === active.id);
    if (!activeTodo) return;

    if (
      over.id &&
      typeof over.id === "string" &&
      DAYS_OF_WEEK.some((day) => day.day === over.id)
    ) {
      const newDay = over.id as DayOfWeek;
      if (activeTodo.day !== newDay) {
        updateTodoDay(activeTodo.id, newDay);
      }
      return;
    }

    const activeIndex = todos.findIndex((t) => t.id === active.id);
    const overIndex = todos.findIndex((t) => t.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const activeDay = activeTodo.day;
      const dayTodos = todos.filter((t) => t.day === activeDay);
      const dayActiveIndex = dayTodos.findIndex((t) => t.id === active.id);
      const dayOverIndex = dayTodos.findIndex((t) => t.id === over.id);

      if (dayActiveIndex !== -1 && dayOverIndex !== -1) {
        // TODO: Handle reordering within the same day
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>basic todo</h1>
        <UserButton />
      </header>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="days-container">
          {DAYS_OF_WEEK.map(({ day, label }) => (
            <DayColumn
              key={day}
              day={day}
              label={label}
              todos={getTodosForDay(day)}
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
              onAdd={addTodo}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTodo ? (
            <SortableTodoItem
              todo={activeTodo}
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

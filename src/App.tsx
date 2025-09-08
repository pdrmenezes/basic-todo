import { useState, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Todo, DayOfWeek } from "./types";
import { DAYS_OF_WEEK } from "./constants/days";
import {
  loadTodos,
  saveTodos,
  getTodosByDay,
  generateId,
} from "./utils/localStorage";
import { DayColumn } from "./components/DayColumn";
import { SortableTodoItem } from "./components/SortableTodoItem";

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const handleAddTodo = (text: string, day: DayOfWeek) => {
    const newTodo: Todo = {
      id: generateId(),
      text,
      completed: false,
      day,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    );
  };

  const handleEditTodo = (id: string, text: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text, updatedAt: new Date() } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

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
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === active.id
              ? { ...todo, day: newDay, updatedAt: new Date() }
              : todo
          )
        );
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
        const reorderedDayTodos = arrayMove(
          dayTodos,
          dayActiveIndex,
          dayOverIndex
        );
        const otherTodos = todos.filter((t) => t.day !== activeDay);
        const reorderedTodos = [...otherTodos, ...reorderedDayTodos];
        setTodos(reorderedTodos);
      }
    }
  };

  const getTodosForDay = (day: DayOfWeek) => {
    return getTodosByDay(todos, day);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>basic todo</h1>
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
              onToggle={handleToggleTodo}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
              onAdd={handleAddTodo}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTodo ? (
            <SortableTodoItem
              todo={activeTodo}
              onToggle={handleToggleTodo}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default App;

import type { Todo, DayOfWeek } from "../types";

const STORAGE_KEY = "basic-todo";

export const loadTodos = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
    }));
  } catch (error) {
    console.error("Error loading todos from localStorage:", error);
    return [];
  }
};

export const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Error saving todos to localStorage:", error);
  }
};

export const getTodosByDay = (todos: Todo[], day: DayOfWeek): Todo[] => {
  return todos.filter((todo) => todo.day === day);
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

import { useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { todoService, userService } from "../db/services";
import type { DayOfWeek, Todo } from "../types";

export function useTodos() {
  const { user, isLoaded } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodosData = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError(null);

      if (user) {
        const dbUser = await userService.findByClerkId(user.id);
        if (dbUser) {
          const dbTodos = await todoService.findByUserId(dbUser.id);
          setTodos(dbTodos);
        } else {
          setTodos([]);
        }
      } else {
        setTodos([]);
      }
    } catch (err) {
      console.error("Error loading todos:", err);
      setError("Failed to load todos");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const addTodo = useCallback(
    async (text: string, day: DayOfWeek) => {
      if (!isLoaded || !user) {
        setError("Please sign in to add todos");
        return;
      }

      try {
        const dbUser = await userService.findByClerkId(user.id);
        if (dbUser) {
          const createResult = await todoService.create({
            userId: dbUser.id,
            text,
            completed: false,
            day,
          });
          if (createResult.success && createResult.data) {
            setTodos((prev) => [...prev, createResult.data!]);
          } else {
            setError(createResult.error || "Failed to create todo");
          }
        } else {
          setError("User not found in database");
        }
      } catch (err) {
        console.error("Error adding todo:", err);
        setError("Failed to add todo");
      }
    },
    [user, isLoaded]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      if (!isLoaded || !user) {
        setError("Please sign in to update todos");
        return;
      }

      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
        updatedAt: new Date(),
      };

      try {
        const updateResult = await todoService.update(id, {
          completed: updatedTodo.completed,
        });
        if (updateResult.success && updateResult.data) {
          setTodos((prev) =>
            prev.map((t) => (t.id === id ? updateResult.data! : t))
          );
        } else {
          setError(updateResult.error || "Failed to update todo");
        }
      } catch (err) {
        console.error("Error toggling todo:", err);
        setError("Failed to update todo");
      }
    },
    [user, isLoaded, todos]
  );

  const editTodo = useCallback(
    async (id: string, text: string) => {
      if (!isLoaded || !user) {
        setError("Please sign in to edit todos");
        return;
      }

      try {
        const updateResult = await todoService.update(id, { text });
        if (updateResult.success && updateResult.data) {
          setTodos((prev) =>
            prev.map((t) => (t.id === id ? updateResult.data! : t))
          );
        } else {
          setError(updateResult.error || "Failed to update todo");
        }
      } catch (err) {
        console.error("Error editing todo:", err);
        setError("Failed to update todo");
      }
    },
    [user, isLoaded]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!isLoaded || !user) {
        setError("Please sign in to delete todos");
        return;
      }

      const dbUser = await userService.findByClerkId(user.id);

      if (!dbUser) {
        setError("User not found in database");
        return;
      }

      try {
        const deleteResult = await todoService.delete(id, dbUser.id);
        if (deleteResult.success) {
          setTodos((prev) => prev.filter((t) => t.id !== id));
        } else {
          setError(deleteResult.error || "Failed to delete todo");
        }
      } catch (err) {
        console.error("Error deleting todo:", err);
        setError("Failed to delete todo");
      }
    },
    [user, isLoaded]
  );

  const updateTodoDay = useCallback(
    async (id: string, day: DayOfWeek) => {
      if (!isLoaded || !user) {
        setError("Please sign in to update todos");
        return;
      }

      try {
        const updateResult = await todoService.update(id, { day });
        if (updateResult.success && updateResult.data) {
          setTodos((prev) =>
            prev.map((t) => (t.id === id ? updateResult.data! : t))
          );
        } else {
          setError(updateResult.error || "Failed to update todo");
        }
      } catch (err) {
        console.error("Error updating todo day:", err);
        setError("Failed to update todo");
      }
    },
    [user, isLoaded]
  );

  const getTodosForDay = useCallback(
    (day: DayOfWeek) => {
      return todos.filter((todo) => todo.day === day);
    },
    [todos]
  );

  useEffect(() => {
    loadTodosData();
  }, [loadTodosData]);

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    updateTodoDay,
    getTodosForDay,
    refreshTodos: loadTodosData,
  };
}

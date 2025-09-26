import { and, asc, eq } from "drizzle-orm";
import type { ApiResponse, DayOfWeek } from "../types";
import {
  db,
  todos,
  users,
  type NewTodo,
  type NewUser,
  type Todo,
  type User,
} from "./index";

export const userService = {
  async create(userData: NewUser): Promise<ApiResponse<User>> {
    try {
      if (!db) {
        return {
          success: false,
          error: "Database not available",
        };
      }

      if (!userData.clerkId || !userData.email) {
        return {
          success: false,
          error: "Missing required fields: clerkId and email are required",
        };
      }

      const existingUser = await this.findByClerkId(userData.clerkId);
      if (existingUser) {
        return {
          success: false,
          error: "User with this Clerk ID already exists",
        };
      }

      const [user] = await db.insert(users).values(userData).returning();
      return {
        success: true,
        data: user,
        message: "User created successfully",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: "Failed to create user",
      };
    }
  },

  async findByClerkId(clerkId: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId));
      return user || null;
    } catch (error) {
      console.error("Error finding user by Clerk ID:", error);
      return null;
    }
  },

  async findById(id: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  },

  async update(
    id: string,
    userData: Partial<NewUser>
  ): Promise<ApiResponse<User>> {
    try {
      const [user] = await db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        data: user,
        message: "User updated successfully",
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: "Failed to update user",
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      const success = result.length > 0;

      return {
        success,
        data: success,
        message: success ? "User deleted successfully" : "User not found",
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        error: "Failed to delete user",
      };
    }
  },

  async getStats(userId: string): Promise<
    ApiResponse<{
      totalTodos: number;
      completedTodos: number;
      pendingTodos: number;
    }>
  > {
    try {
      const userTodos = await todoService.findByUserId(userId);
      const totalTodos = userTodos.length;
      const completedTodos = userTodos.filter((todo) => todo.completed).length;
      const pendingTodos = totalTodos - completedTodos;

      return {
        success: true,
        data: { totalTodos, completedTodos, pendingTodos },
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        success: false,
        error: "Failed to get user statistics",
      };
    }
  },
};

export const todoService = {
  async create(todoData: NewTodo): Promise<ApiResponse<Todo>> {
    try {
      if (!todoData.userId || !todoData.text || !todoData.day) {
        return {
          success: false,
          error: "Missing required fields: userId, text, and day are required",
        };
      }

      const validDays: DayOfWeek[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "weekend",
      ];
      if (!validDays.includes(todoData.day as DayOfWeek)) {
        return {
          success: false,
          error: "Invalid day value",
        };
      }

      const [todo] = await db.insert(todos).values(todoData).returning();
      return {
        success: true,
        data: todo,
        message: "Todo created successfully",
      };
    } catch (error) {
      console.error("Error creating todo:", error);
      return {
        success: false,
        error: "Failed to create todo",
      };
    }
  },

  async findByUserId(userId: string): Promise<Todo[]> {
    try {
      return await db
        .select()
        .from(todos)
        .where(eq(todos.userId, userId))
        .orderBy(asc(todos.createdAt));
    } catch (error) {
      console.error("Error finding todos by user ID:", error);
      return [];
    }
  },

  async findByUserIdAndDay(userId: string, day: DayOfWeek): Promise<Todo[]> {
    try {
      return await db
        .select()
        .from(todos)
        .where(and(eq(todos.userId, userId), eq(todos.day, day)))
        .orderBy(asc(todos.createdAt));
    } catch (error) {
      console.error("Error finding todos by user ID and day:", error);
      return [];
    }
  },

  async findById(id: string): Promise<Todo | null> {
    try {
      const [todo] = await db.select().from(todos).where(eq(todos.id, id));
      return todo || null;
    } catch (error) {
      console.error("Error finding todo by ID:", error);
      return null;
    }
  },

  async update(
    id: string,
    todoData: Partial<NewTodo>
  ): Promise<ApiResponse<Todo>> {
    try {
      if (todoData.day) {
        const validDays: DayOfWeek[] = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "weekend",
        ];
        if (!validDays.includes(todoData.day as DayOfWeek)) {
          return {
            success: false,
            error: "Invalid day value",
          };
        }
      }

      const [todo] = await db
        .update(todos)
        .set({ ...todoData, updatedAt: new Date() })
        .where(eq(todos.id, id))
        .returning();

      if (!todo) {
        return {
          success: false,
          error: "Todo not found",
        };
      }

      return {
        success: true,
        data: todo,
        message: "Todo updated successfully",
      };
    } catch (error) {
      console.error("Error updating todo:", error);
      return {
        success: false,
        error: "Failed to update todo",
      };
    }
  },

  async delete(id: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await db
        .delete(todos)
        .where(and(eq(todos.id, id), eq(todos.userId, userId)));
      const success = result.rowCount === 1;

      return {
        success,
        data: success,
        message: success ? "Todo deleted successfully" : "Todo not found",
      };
    } catch (error) {
      console.error("Error deleting todo:", error);
      return {
        success: false,
        error: "Failed to delete todo",
      };
    }
  },

  async deleteByUserId(userId: string): Promise<ApiResponse<number>> {
    try {
      const result = await db.delete(todos).where(eq(todos.userId, userId));
      const deletedCount = result.length || 0;

      return {
        success: true,
        data: deletedCount,
        message: `Deleted ${deletedCount} todos`,
      };
    } catch (error) {
      console.error("Error deleting todos by user ID:", error);
      return {
        success: false,
        error: "Failed to delete todos",
      };
    }
  },
};

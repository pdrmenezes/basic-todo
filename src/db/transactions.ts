import { db } from "./index";
import { users, todos } from "./schema";
import { eq } from "drizzle-orm";
import type { NewUser, NewTodo, ApiResponse } from "../types";

export interface MigrationTransactionData {
  user: NewUser;
  todos: NewTodo[];
}

export async function deleteUserWithTodos(
  userId: string
): Promise<ApiResponse<{ deletedTodos: number }>> {
  try {
    return await db.transaction(async (tx: any) => {
      const todosToDelete = await tx
        .select()
        .from(todos)
        .where(eq(todos.userId, userId));
      const todoCount = todosToDelete.length;

      await tx.delete(todos).where(eq(todos.userId, userId));

      await tx.delete(users).where(eq(users.id, userId));

      return {
        success: true,
        data: { deletedTodos: todoCount },
        message: `Successfully deleted user and ${todoCount} todos`,
      };
    });
  } catch (error) {
    console.error("Delete user transaction failed:", error);
    return {
      success: false,
      error: "Failed to delete user and todos",
    };
  }
}

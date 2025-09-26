import { and, eq, lte } from "drizzle-orm";
import type { ApiResponse } from "../types";
import { db } from "./index";
import { todos } from "./schema";

export async function cleanupOldData(
  daysOld: number = 30
): Promise<ApiResponse<{ deletedTodos: number }>> {
  try {
    const isClearableDate = new Date();
    isClearableDate.setDate(isClearableDate.getDate() - daysOld);

    const result = await db
      .delete(todos)
      .where(
        and(eq(todos.completed, true), lte(todos.updatedAt, isClearableDate))
      );

    const deletedCount = result.length || 0;

    return {
      success: true,
      data: { deletedTodos: deletedCount },
      message: `Cleaned up ${deletedCount} old completed todos`,
    };
  } catch (error) {
    console.error("Error cleaning up old data:", error);
    return {
      success: false,
      error: "Failed to cleanup old data",
    };
  }
}

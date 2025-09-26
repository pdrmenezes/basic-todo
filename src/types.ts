import type { Todo } from "./db/schema";
export type { User, NewUser, Todo, NewTodo } from "./db/schema";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "weekend";

export type DayColumn = {
  day: DayOfWeek;
  label: string;
  todos: Todo[];
};

export type AuthUser = {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TodoWithUser = Todo & {
  user: Pick<AuthUser, "id" | "firstName" | "lastName" | "imageUrl">;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type CreateTodoData = {
  text: string;
  day: DayOfWeek;
  userId: string;
};

export type UpdateTodoData = {
  text?: string;
  completed?: boolean;
  day?: DayOfWeek;
};

export type CreateUserData = {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

export type UpdateUserData = {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

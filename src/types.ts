export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  day: DayOfWeek;
  createdAt: Date;
  updatedAt: Date;
};

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

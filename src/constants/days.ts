import type { DayColumn, DayOfWeek } from "../types";

export const DAYS_OF_WEEK: DayColumn[] = [
  { day: "monday", label: "monday", todos: [] },
  { day: "tuesday", label: "tuesday", todos: [] },
  { day: "wednesday", label: "wednesday", todos: [] },
  { day: "thursday", label: "thursday", todos: [] },
  { day: "friday", label: "friday", todos: [] },
  { day: "weekend", label: "weekend", todos: [] },
];

export const DAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "weekend",
];

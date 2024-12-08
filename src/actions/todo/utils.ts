import "server-only";

import { getUser } from "@/lib/lucia";
import { db } from "@/lib/prisma";
import { z } from "zod";

// Define reminder types as const
export const REMINDER_TYPES = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY'
} as const;

// Create a type from the values
export type ReminderType = typeof REMINDER_TYPES[keyof typeof REMINDER_TYPES];

export type ReminderSchedule = {
  id: string;
  isEnabled: boolean;
  startTime: Date;
  repeatType: ReminderType | null;
  repeatDays: string | null;
  repeatDate: number | null;
  repeatStart: Date | null;
  repeatEnd: Date | null;
  lastTriggered: Date | null;
  createdAt: Date;
  updatedAt: Date;
  todoId: string;
};

export type Todo = {
  id: string;
  title: string;
  description?: string;
  isDone: boolean;
  startDate?: Date;
  endDate?: Date;
  labels?: string[];
  subTodos?: Todo[];
  reminder?: ReminderSchedule | null;
};

export type ApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T[];
};

export const ReminderSchema = z.object({
  isEnabled: z.boolean().default(true),
  startTime: z.date(),
  repeatType: z.enum([
    REMINDER_TYPES.NONE,
    REMINDER_TYPES.DAILY,
    REMINDER_TYPES.WEEKLY,
    REMINDER_TYPES.MONTHLY
  ]).nullable(),
  repeatDays: z.string().nullable(),
  repeatDate: z.number().min(1).max(31).nullable(),
  repeatStart: z.date().nullable(),
  repeatEnd: z.date().nullable(),
});

export const TodoSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字符"),
  description: z.string().max(300, '描述不能超過300個字符').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isDone: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
  reminder: ReminderSchema.optional(),
});

export async function handleUserAuth<T>(): Promise<{ dbUser: any } | { error: ApiResponse<T> }> {
  const user = await getUser();
  if (!user) {
    return { error: { status: "error", message: "Unauthorized", data: [] } };
  }
  const dbUser = await db.user.findUnique({
    where: { email: user.email }
  });
  if (!dbUser) {
    return { error: { status: "error", message: "User not found", data: [] } };
  }
  return { dbUser };
}

export function formatTodo(todo: any): Todo {
  return {
    ...todo,
    description: todo.description ?? undefined,
    startDate: todo.startDate ?? undefined,
    endDate: todo.endDate ?? undefined,
    labels: todo.labels ? todo.labels.map((label: any) => label.name) : undefined,
    reminder: todo.reminder ?? undefined
  };
}

export function handleError(error: any, message: string): ApiResponse<Todo> {
  console.error(`${message}:`, error);
  return { status: "error", message, data: [] };
}

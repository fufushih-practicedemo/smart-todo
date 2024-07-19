import "server-only";

import { getUser } from "@/lib/lucia";
import { db } from "@/lib/prisma";
import { z } from "zod";

export type Todo = {
  id: string;
  title: string;
  description?: string;
  isDone: boolean;
  startDate?: Date;
  endDate?: Date;
  labels?: string[];
  subTodos?: Todo[];
};

export type ApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T[];
};

export const TodoSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字符"),
  description: z.string().max(300, '描述不能超過300個字符').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isDone: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
});

export async function handleUserAuth(): Promise<{ dbUser: any } | { error: ApiResponse<Todo> }> {
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
    labels: todo.labels ? todo.labels.map((label: any) => label.name) : undefined
  };
}

export function handleError(error: any, message: string): ApiResponse<Todo> {
  console.error(`${message}:`, error);
  return { status: "error", message, data: [] };
}

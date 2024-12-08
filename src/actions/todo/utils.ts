import "server-only";

import { getUser } from "@/lib/lucia";
import { db } from "@/lib/prisma";
import { ApiResponse, Todo } from "@actions/types";

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

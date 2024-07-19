"use server";

import { ApiResponse, Todo, formatTodo, handleError, handleUserAuth } from "./utils";
import { db } from "@/lib/prisma";

export const getTodos = async (): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const todos = await db.todo.findMany({
      where: { userId: dbUser.id, isDeleted: false },
      include: { labels: true },
    });

    const formattedTodos = todos.map((todo) => (formatTodo(todo)))

    return { status: "success", message: "Todo created successfully", data: formattedTodos };
  } catch (error) {
    return handleError(error, "Failed to fetch todos");
  }
};

const fetchSubTodos = async (todoId: string, userId: string): Promise<Todo[]> => {
  const subTodos = await db.todo.findMany({
    where: { parentId: todoId, userId },
    include: { labels: true },
  });

  const subTodosWithChildren = await Promise.all(subTodos.map(async (subTodo) => {
    const children = await fetchSubTodos(subTodo.id, userId);
    return {
      ...subTodo,
      description: subTodo.description ?? undefined,
      labels: subTodo.labels.map((label) => label.name),
      startDate: subTodo.startDate ?? undefined,
      endDate: subTodo.endDate ?? undefined,
      subTodos: children
    };
  }));

  return subTodosWithChildren;
};

export const getTodosWithSubTodos = async (): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const topLevelTodos = await db.todo.findMany({
      where: { userId: dbUser.id, parentId: null, isDeleted: false },
      include: { labels: true },
    });

    const todosWithSubTodos = await Promise.all(topLevelTodos.map(async (todo) => {
      const subTodos = await fetchSubTodos(todo.id, dbUser.id);
      return {
        ...todo,
        description: todo.description ?? undefined,
        labels: todo.labels.map((label) => label.name),
        startDate: todo.startDate ?? undefined,
        endDate: todo.endDate ?? undefined,
        subTodos: subTodos
      };
    }));

    return { status: "success", message: "Todos with subtodos fetched successfully", data: todosWithSubTodos };
  } catch (error) {
    return handleError(error, "Failed to fetch todos with subtodos");
  }
};

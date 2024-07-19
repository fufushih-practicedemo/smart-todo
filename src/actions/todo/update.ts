import "server-only";

import { z } from "zod";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApiResponse, Todo, TodoSchema, formatTodo, handleError, handleUserAuth } from "./utils";

export const updateTodo = async (id: string, values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const validatedFields = TodoSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const todo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: {
        ...validatedFields.data,
        labels: {
          set: [],
          connectOrCreate: validatedFields.data.labels?.map(label => ({
            where: { name: label },
            create: { name: label },
          })) || [],
        },
      },
    });

    const formattedTodo = formatTodo(todo);

    revalidatePath('/')
    return { status: "success", message: "Todo updated successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to update todo");
  }
};

export const restoreTodo = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const restoredTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: false },
    });

    const formattedTodo = formatTodo(restoredTodo);

    revalidatePath('/')
    return { status: "success", message: "Todo successfully restored", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to restore todo");
  }
};

export const toggleTodoStatus = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const todo = await db.todo.findUnique({ where: { id, userId: dbUser.id } });
    if (!todo) {
      return { status: "error", message: "Todo not found", data: [] };
    }

    const updatedTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDone: !todo.isDone },
    });
    const formattedTodo = formatTodo(updatedTodo);

    revalidatePath("/todos");
    return { status: "success", message: "Todo status toggled successfully", data: [formattedTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to toggle todo status", data: [] };
  }
};

export const toggleTodoAndSubTodosStatus = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const todo = await db.todo.findUnique({ where: { id, userId: dbUser.id } });
    if (!todo) {
      return { status: "error", message: "Todo not found", data: [] };
    }

    const newStatus = !todo.isDone;

    const updateSubTodosStatus = async (todoId: string) => {
      const subTodos = await db.todo.findMany({ where: { parentId: todoId, userId: dbUser.id } });
      for (const subTodo of subTodos) {
        await db.todo.update({
          where: { id: subTodo.id, userId: dbUser.id },
          data: { isDone: newStatus },
        });
        await updateSubTodosStatus(subTodo.id);
      }
    };

    const updatedTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDone: newStatus },
    });
    await updateSubTodosStatus(id);

    const formattedTodo = formatTodo(updatedTodo);

    revalidatePath("/todos");
    return { status: "success", message: "Todo and subtodos status toggled successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to toggle todo and subtodos status");
  }
};

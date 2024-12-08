import "server-only";

import { z } from "zod";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApiResponse, Todo, TodoSchema, formatTodo, handleError, handleUserAuth } from "./utils";

export const updateTodo = async (id: string, values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth<Todo>();
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
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        startDate: validatedFields.data.startDate,
        endDate: validatedFields.data.endDate,
        isDone: validatedFields.data.isDone ?? false,
        labels: {
          set: [],
          connectOrCreate: validatedFields.data.labels?.map(label => ({
            where: { name: label },
            create: { name: label },
          })) || [],
        },
        // Update or create reminder with correct types
        ...(validatedFields.data.reminder && {
          reminder: {
            upsert: {
              create: {
                isEnabled: validatedFields.data.reminder.isEnabled,
                startTime: validatedFields.data.reminder.startTime,
                repeatType: validatedFields.data.reminder.repeatType ?? null,
                repeatDays: validatedFields.data.reminder.repeatDays ?? null,
                repeatDate: validatedFields.data.reminder.repeatDate ?? null,
                repeatStart: validatedFields.data.reminder.repeatStart ?? null,
                repeatEnd: validatedFields.data.reminder.repeatEnd ?? null,
              },
              update: {
                isEnabled: validatedFields.data.reminder.isEnabled,
                startTime: validatedFields.data.reminder.startTime,
                repeatType: validatedFields.data.reminder.repeatType ?? null,
                repeatDays: validatedFields.data.reminder.repeatDays ?? null,
                repeatDate: validatedFields.data.reminder.repeatDate ?? null,
                repeatStart: validatedFields.data.reminder.repeatStart ?? null,
                repeatEnd: validatedFields.data.reminder.repeatEnd ?? null,
              }
            }
          }
        }),
        // Delete reminder if not provided
        ...(validatedFields.data.reminder === undefined && {
          reminder: {
            delete: true
          }
        })
      },
      include: {
        labels: true,
        reminder: true
      }
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
    const authResult = await handleUserAuth<Todo>();
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

const restoreSubTodosRecursively = async (todoId: string, userId: string) => {
  const subTodos = await db.todo.findMany({
    where: { parentId: todoId, userId }
  });

  for (const subTodo of subTodos) {
    await db.todo.update({
      where: { id: subTodo.id, userId },
      data: { isDeleted: false }
    });
    await restoreSubTodosRecursively(subTodo.id, userId);
  }
}

export const restoreTodoAndSubTodos = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth<Todo>();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    await restoreSubTodosRecursively(id, dbUser.id);

    const restoredTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: false },
      include: { labels: true },
    });

    const formattedTodo = formatTodo(restoredTodo);

    revalidatePath('/')
    return { status: "success", message: "Todo and all subtodos successfully restored", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to restore todo and subtodos");
  }
};

export const toggleTodoStatus = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth<Todo>();
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
    const authResult = await handleUserAuth<Todo>();
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

export const updateTodoStatus = async (id: string, status: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth<Todo>();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const todo = await db.todo.findUnique({
      where: { id, userId: dbUser.id },
      include: { labels: true, reminder: true }
    });

    if (!todo) {
      return { status: "error", message: "Todo not found", data: [] };
    }

    // Remove old status label
    const oldStatusLabel = todo.labels.find(l => l.type === 'STATUS');
    
    const updatedTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: {
        startDate: todo.startDate,
        isDone: status.toLowerCase() === 'done',
        labels: {
          disconnect: oldStatusLabel ? [{ id: oldStatusLabel.id }] : undefined,
          connect: [{ name: status }]
        }
      },
      include: {
        labels: true,
        reminder: true
      }
    });

    const formattedTodo = formatTodo(updatedTodo);

    revalidatePath('/')
    return { status: "success", message: "Todo status updated successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to update todo status");
  }
};

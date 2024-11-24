import "server-only";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApiResponse, Todo, formatTodo, handleError, handleUserAuth } from "./utils";

export const deleteTodo = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const updatedTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: true },
      include: {
        labels: true,
        reminder: true
      }
    });

    const formattedTodo = formatTodo(updatedTodo);

    revalidatePath('/')
    return { status: "success", message: "Todo deleted successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to delete todo");
  }
};

const deleteSubTodosRecursively = async (todoId: string, userId: string) => {
  const subTodos = await db.todo.findMany({
    where: { parentId: todoId, userId: userId },
  });

  for (const subTodo of subTodos) {
    await deleteSubTodosRecursively(subTodo.id, userId);
    // delete sub task
    await db.todo.delete({
      where: { id: subTodo.id, userId: userId }
    });
  }
};

export const deleteTodoAndSubTodos = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    // delte reminder first
    await db.reminderSchedule.deleteMany({
      where: { todo: { id, userId: dbUser.id } }
    });

    // delete all subtodo
    await deleteSubTodosRecursively(id, dbUser.id);

    // mark is delete with todo
    const updatedTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: true },
      include: {
        labels: true,
        reminder: true
      }
    });

    const formattedTodo = formatTodo(updatedTodo);

    revalidatePath('/')
    return { status: "success", message: "Todo and all subtodos deleted successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to delete todo and subtodos");
  }
};

export const getDeletedTodos = async (): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const deletedTodos = await db.todo.findMany({
      where: { userId: dbUser.id, isDeleted: true },
      include: {
        labels: true,
        reminder: true
      }
    });

    const filteredTodos = deletedTodos.map((todo) => (formatTodo(todo)));

    return { status: "success", message: "Deleted todos fetched successfully", data: filteredTodos };
  } catch (error) {
    // console.error("Failed to fetch deleted todos:", error);
    return handleError(error, "Failed to fetch deleted todos");
  }
};

export const permanentDeleteTodoAndSubTodos = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    // Delete reminder first
    await db.reminderSchedule.deleteMany({
      where: { todo: { id, userId: dbUser.id } }
    });

    // Delete all subtodos
    await deleteSubTodosRecursively(id, dbUser.id);

    // Delete the main todo
    const deletedTodo = await db.todo.delete({
      where: { id, userId: dbUser.id },
      include: {
        labels: true,
        reminder: true
      }
    });

    const formattedTodo = formatTodo(deletedTodo);

    revalidatePath('/')
    return { status: "success", message: "Todo and subtodos permanently deleted", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to permanently delete todo and subtodos");
  }
};

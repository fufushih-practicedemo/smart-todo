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
    await db.todo.delete({
      where: { id: subTodo.id, userId: userId },
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

    // delete all subtodo
    await deleteSubTodosRecursively(id, dbUser.id);

    // mark is delete with todo
    const updatedTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: true },
      include: { labels: true },
    });

    const formattedTodo = formatTodo(updatedTodo);

    revalidatePath('/')
    return { status: "success", message: "Todo and all subtodos deleted successfully", data: [formattedTodo] };
  } catch (error) {
    // console.error("Failed to delete todo and subtodos:", error);
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
      include: { labels: true },
    });

    const filteredTodos = deletedTodos.map((todo) => (formatTodo(todo)));

    return { status: "success", message: "Deleted todos fetched successfully", data: filteredTodos };
  } catch (error) {
    // console.error("Failed to fetch deleted todos:", error);
    return handleError(error, "Failed to fetch deleted todos");
  }
};

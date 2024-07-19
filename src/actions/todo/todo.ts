"use server";

import { z } from "zod";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/lucia";
import { ApiResponse, Todo, TodoSchema, formatTodo, handleError, handleUserAuth } from "./utils";


export const createTodo = async (values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    const validatedFields = TodoSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const todo = await db.todo.create({
      data: {
        ...validatedFields.data,
        user: { connect: { id: dbUser.id } },
        labels: {
          connectOrCreate: validatedFields.data.labels?.map(label => ({
            where: { name: label },
            create: { name: label },
          })) || [],
        },
      },
    });

    const formattedTodo = formatTodo(todo);

    revalidatePath('/')
    return { status: "success", message: "Todo created successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to create todo");
  }
};

export const createSubTodo = async (parentId: string, values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const validatedFields = TodoSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const parentTodo = await db.todo.findUnique({
      where: { id: parentId, userId: dbUser.id }
    });
    if (!parentTodo) {
      return { status: "error", message: "Parent todo not found", data: [] };
    }

    const subTodo = await db.todo.create({
      data: {
        ...validatedFields.data,
        user: { connect: { id: dbUser.id } },
        parentTodo: { connect: { id: parentId } },
        labels: {
          connectOrCreate: validatedFields.data.labels?.map(label => ({
            where: { name: label },
            create: { name: label },
          })) || [],
        },
      },
    });

    const filterSubTodo: Todo = {
      ...subTodo,
      description: subTodo.description ?? undefined,
      startDate: subTodo.startDate ?? undefined,
      endDate: subTodo.endDate ?? undefined
    }

    revalidatePath('/')
    return { status: "success", message: "SubTodo created successfully", data: [filterSubTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to create subTodo", data: [] };
  }
};

export const getTodos = async (): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const todos = await db.todo.findMany({
      where: { userId: dbUser.id, isDeleted: false },
      include: { labels: true },
    });

    const filtedTodos = todos.map((todo) => ({
      ...todo,
      description: todo.description ?? undefined,
      labels: todo.labels.map((label) => label.name),
      startDate: todo.startDate ?? undefined,
      endDate: todo.endDate ?? undefined
    }))

    return { status: "success", message: "Todos fetched successfully", data: filtedTodos };
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return { status: "error", message: "Failed to fetch todos", data: [] };
  }
};

const fetchSubTodos = async (todoId: string, userId: string): Promise<Todo[]> => {
  const subTodos = await db.todo.findMany({
    where: { parentId: todoId, userId: userId },
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
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
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
    console.error("Failed to fetch todos with subtodos:", error);
    return { status: "error", message: "Failed to fetch todos with subtodos", data: [] };
  }
};

export const updateTodo = async (id: string, values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
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
    const filterTodo: Todo = {
      ...todo,
      description: todo.description ?? undefined,
      startDate: todo.startDate ?? undefined,
      endDate: todo.endDate ?? undefined
    }

    revalidatePath('/')
    return { status: "success", message: "Todo updated successfully", data: [filterTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to update todo", data: [] };
  }
};

export const deleteTodo = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const updatedTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: true },
    });

    const filterTodo: Todo = {
      ...updatedTodo,
      description: updatedTodo.description ?? undefined,
      startDate: updatedTodo.startDate ?? undefined,
      endDate: updatedTodo.endDate ?? undefined
    }

    revalidatePath('/')
    return { status: "success", message: "Todo deleted successfully", data: [filterTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to delete todo", data: [] };
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
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
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

    const filterTodo: Todo = {
      ...updatedTodo,
      description: updatedTodo.description ?? undefined,
      labels: updatedTodo.labels.map((label) => label.name),
      startDate: updatedTodo.startDate ?? undefined,
      endDate: updatedTodo.endDate ?? undefined
    }

    revalidatePath('/')
    return { status: "success", message: "Todo and all subtodos deleted successfully", data: [filterTodo] };
  } catch (error) {
    console.error("Failed to delete todo and subtodos:", error);
    return { status: "error", message: "Failed to delete todo and subtodos", data: [] };
  }
};

export const getDeletedTodos = async (): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const deletedTodos = await db.todo.findMany({
      where: { userId: dbUser.id, isDeleted: true },
      include: { labels: true },
    });

    const filteredTodos = deletedTodos.map((todo) => ({
      ...todo,
      description: todo.description ?? undefined,
      labels: todo.labels.map((label) => label.name),
      startDate: todo.startDate ?? undefined,
      endDate: todo.endDate ?? undefined
    }));

    return { status: "success", message: "Deleted todos fetched successfully", data: filteredTodos };
  } catch (error) {
    console.error("Failed to fetch deleted todos:", error);
    return { status: "error", message: "Failed to fetch deleted todos", data: [] };
  }
};

export const restoreTodo = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const restoredTodo = await db.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: false },
    });

    const filterTodo: Todo = {
      ...restoredTodo,
      description: restoredTodo.description ?? undefined,
      startDate: restoredTodo.startDate ?? undefined,
      endDate: restoredTodo.endDate ?? undefined
    }

    revalidatePath('/')
    return { status: "success", message: "Todo successfully restored", data: [filterTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to restore todo", data: [] };
  }
};

export const toggleTodoStatus = async (id: string): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await db.user.findUnique({
      where: { email: user.email }
    });
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
    const filterTodo: Todo = {
      ...updatedTodo,
      description: todo.description ?? undefined,
      startDate: todo.startDate ?? undefined,
      endDate: todo.endDate ?? undefined
    }
    

    revalidatePath("/todos");
    return { status: "success", message: "Todo status toggled successfully", data: [filterTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to toggle todo status", data: [] };
  }
};

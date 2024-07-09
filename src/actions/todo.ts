"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/lucia";

export type Todo = {
  id: string;
  title: string;
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

const TodoSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字符"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isDone: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
});

export const createTodo = async (values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const validatedFields = TodoSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const todo = await prisma.todo.create({
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
    const filterTodo: Todo = {
      ...todo,
      startDate: todo.startDate ?? undefined,
      endDate: todo.endDate ?? undefined
    }

    revalidatePath('/')
    return { status: "success", message: "Todo created successfully", data: [filterTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to create todo", data: [] };
  }
};

export const getTodos = async (): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const todos = await prisma.todo.findMany({
      where: { userId: dbUser.id, isDeleted: false },
      include: { labels: true },
    });

    const filtedTodos = todos.map((todo) => ({
      ...todo,
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

export const updateTodo = async (id: string, values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const validatedFields = TodoSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const todo = await prisma.todo.update({
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
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const updatedTodo = await prisma.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: true },
    });

    const filterTodo: Todo = {
      ...updatedTodo,
      startDate: updatedTodo.startDate ?? undefined,
      endDate: updatedTodo.endDate ?? undefined
    }

    revalidatePath('/')
    return { status: "success", message: "Todo deleted successfully", data: [filterTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to delete todo", data: [] };
  }
};

export const getDeletedTodos = async (): Promise<ApiResponse<Todo>> => {
  try {
    const user = await getUser();
    if (!user) {
      return { status: "error", message: "Unauthorized", data: [] };
    }
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const deletedTodos = await prisma.todo.findMany({
      where: { userId: dbUser.id, isDeleted: true },
      include: { labels: true },
    });

    const filteredTodos = deletedTodos.map((todo) => ({
      ...todo,
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
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const restoredTodo = await prisma.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDeleted: false },
    });

    const filterTodo: Todo = {
      ...restoredTodo,
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
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!dbUser) {
      return { status: "error", message: "User not found", data: [] };
    }

    const todo = await prisma.todo.findUnique({ where: { id, userId: dbUser.id } });
    if (!todo) {
      return { status: "error", message: "Todo not found", data: [] };
    }

    const updatedTodo = await prisma.todo.update({
      where: { id, userId: dbUser.id },
      data: { isDone: !todo.isDone },
    });
    const filterTodo: Todo = {
      ...updatedTodo,
      startDate: todo.startDate ?? undefined,
      endDate: todo.endDate ?? undefined
    }
    

    revalidatePath("/todos");
    return { status: "success", message: "Todo status toggled successfully", data: [filterTodo] };
  } catch (error) {
    return { status: "error", message: "Failed to toggle todo status", data: [] };
  }
};

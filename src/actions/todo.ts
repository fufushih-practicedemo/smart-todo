"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma"; // 假設您有一個 prisma 客戶端的實例
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/lucia";

// Todo 的 schema 定義
const TodoSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字符"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isDone: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
});

export const createTodo = async (values: z.infer<typeof TodoSchema>) => {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const dbUser = await prisma.user.findUnique({
      where: {
        email: user.email
      }
    })
    if (!dbUser) {
      return { error: "No User" };
    }
    const userId = dbUser.id;

    const validatedFields = TodoSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const todo = await prisma.todo.create({
      data: {
        ...validatedFields.data,
        user: {
          connect: { id: userId }
        },
        labels: {
          connectOrCreate: validatedFields.data.labels?.map(label => ({
            where: { name: label },
            create: { name: label },
          })) || [],
        },
      },
    });

    return { success: true, todo };
  } catch (error) {
    return { error: "Failed to create todo" };
  }
};

export const getTodos = async () => {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const dbUser = await prisma.user.findUnique({
      where: {
        email: user.email
      }
    })
    if (!dbUser) {
      return { error: "No User" };
    }
    const userId = dbUser.id;

    const todos = await prisma.todo.findMany({
      where: { userId },
      include: { labels: true },
    });
    return todos;
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return [];
  }
};

export const updateTodo = async (id: string, values: z.infer<typeof TodoSchema>) => {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const dbUser = await prisma.user.findUnique({
      where: {
        email: user.email
      }
    })
    if (!dbUser) {
      return { error: "No User" };
    }
    const userId = dbUser.id;

    const validatedFields = TodoSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const todo = await prisma.todo.update({
      where: { id, userId },
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

    revalidatePath("/todos");
    return { success: true, todo };
  } catch (error) {
    return { error: "Failed to update todo" };
  }
};

export const deleteTodo = async (id: string) => {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const dbUser = await prisma.user.findUnique({
      where: {
        email: user.email
      }
    })
    if (!dbUser) {
      return { error: "No User" };
    }
    const userId = dbUser.id;

    await prisma.todo.delete({
      where: { id, userId },
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to delete todo" };
  }
};

export const toggleTodoStatus = async (id: string) => {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const dbUser = await prisma.user.findUnique({
      where: {
        email: user.email
      }
    })
    if (!dbUser) {
      return { error: "No User" };
    }
    const userId = dbUser.id;

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      return { error: "Todo not found" };
    }

    const updatedTodo = await prisma.todo.update({
      where: { id, userId },
      data: { isDone: !todo.isDone },
    });

    revalidatePath("/todos");
    return { success: true, todo: updatedTodo };
  } catch (error) {
    return { error: "Failed to toggle todo status" };
  }
};

import "server-only";

import { ApiResponse, Todo, TodoSchema, formatTodo, handleError, handleUserAuth } from "./utils";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        startDate: validatedFields.data.startDate,
        endDate: validatedFields.data.endDate,
        isDone: validatedFields.data.isDone ?? false,
        user: { 
          connect: { id: dbUser.id } 
        },
        labels: {
          connectOrCreate: validatedFields.data.labels?.map(label => ({
            where: { name: label },
            create: { name: label },
          })) || [],
        },
        // Updated reminder structure
        ...(validatedFields.data.reminder && {
          reminder: {
            create: {
              isEnabled: validatedFields.data.reminder.isEnabled,
              startTime: validatedFields.data.reminder.startTime,
              repeatType: validatedFields.data.reminder.repeatType,
              repeatDays: validatedFields.data.reminder.repeatDays,
              repeatDate: validatedFields.data.reminder.repeatDate,
              repeatStart: validatedFields.data.reminder.repeatStart,
              repeatEnd: validatedFields.data.reminder.repeatEnd,
            }
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
    return { status: "success", message: "Todo created successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to create todo");
  }
};

export const createSubTodo = async (parentId: string, values: z.infer<typeof TodoSchema>): Promise<ApiResponse<Todo>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

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
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        startDate: validatedFields.data.startDate,
        endDate: validatedFields.data.endDate,
        isDone: validatedFields.data.isDone ?? false,
        user: { 
          connect: { id: dbUser.id } 
        },
        parentTodo: { 
          connect: { id: parentId } 
        },
        labels: {
          connectOrCreate: validatedFields.data.labels?.map(label => ({
            where: { name: label },
            create: { name: label },
          })) || [],
        },
        ...(validatedFields.data.reminder && {
          reminder: {
            create: {
              isEnabled: validatedFields.data.reminder.isEnabled,
              startTime: validatedFields.data.reminder.startTime,
              repeatType: validatedFields.data.reminder.repeatType,
              repeatDays: validatedFields.data.reminder.repeatDays,
              repeatDate: validatedFields.data.reminder.repeatDate,
              repeatStart: validatedFields.data.reminder.repeatStart,
              repeatEnd: validatedFields.data.reminder.repeatEnd,
            }
          }
        })
      },
      include: {
        labels: true,
        reminder: true
      }
    });

    const formattedTodo = formatTodo(subTodo);

    revalidatePath('/')
    return { status: "success", message: "SubTodo created successfully", data: [formattedTodo] };
  } catch (error) {
    return handleError(error, "Failed to create subTodo");
  }
};

import "server-only";

import { z } from "zod";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  handleError, 
  handleUserAuth, 
} from './utils';
import { 
  Label, 
  ApiResponse,
  LabelSchema,
} from "../types";

// CRUD Actions
export const createLabel = async (values: z.infer<typeof LabelSchema>): Promise<ApiResponse<Label>> => {
  try {
    await handleUserAuth();

    const validatedFields = LabelSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const label = await db.label.create({
      data: {
        name: validatedFields.data.name,
        type: validatedFields.data.type,
      },
    }) as Label;

    revalidatePath('/');
    return { status: "success", message: "Label created successfully", data: [label] };
  } catch (error) {
    return handleError(error, "Failed to create label");
  }
};

export const getLabels = async (): Promise<ApiResponse<Label>> => {
  try {
    await handleUserAuth();

    const labels = await db.label.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true
      }
    }) as Label[];

    return { status: "success", message: "Labels fetched successfully", data: labels };
  } catch (error) {
    return handleError(error, "Failed to fetch labels");
  }
};

export const updateLabel = async (id: string, values: z.infer<typeof LabelSchema>): Promise<ApiResponse<Label>> => {
  try {
    await handleUserAuth();

    const validatedFields = LabelSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const label = await db.label.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        type: validatedFields.data.type,
      },
      select: {
        id: true,
        name: true,
        type: true
      }
    }) as Label;

    revalidatePath('/');
    return { status: "success", message: "Label updated successfully", data: [label] };
  } catch (error) {
    return handleError(error, "Failed to update label");
  }
};

export const deleteLabel = async (id: string): Promise<ApiResponse<Label>> => {
  try {
    await handleUserAuth();

    const label = await db.label.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true
      }
    }) as Label;

    revalidatePath('/');
    return { status: "success", message: "Label deleted successfully", data: [label] };
  } catch (error) {
    return handleError(error, "Failed to delete label");
  }
};

// Additional utility functions
export const getLabelsByTodo = async (todoId: string): Promise<ApiResponse<Label>> => {
  try {
    await handleUserAuth();

    const todo = await db.todo.findUnique({
      where: { id: todoId },
      include: {
        labels: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    }) as { labels: Label[] };

    if (!todo) {
      return { status: "error", message: "Todo not found", data: [] };
    }

    return { status: "success", message: "Labels fetched successfully", data: todo.labels };
  } catch (error) {
    return handleError(error, "Failed to fetch labels for todo");
  }
};

export const searchLabels = async (searchTerm: string): Promise<ApiResponse<Label>> => {
  try {
    await handleUserAuth();

    const labels = await db.label.findMany({
      where: {
        name: {
          contains: searchTerm
        }
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true
      }
    }) as Label[];

    return { status: "success", message: "Labels searched successfully", data: labels };
  } catch (error) {
    return handleError(error, "Failed to search labels");
  }
};

export const getStatusLabels = async (): Promise<ApiResponse<Label>> => {
  try {
    await handleUserAuth();

    const labels = await db.label.findMany({
      where: { type: 'STATUS' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true
      }
    }) as Label[];

    return { status: "success", message: "Status labels fetched successfully", data: labels };
  } catch (error) {
    return handleError(error, "Failed to fetch status labels");
  }
}

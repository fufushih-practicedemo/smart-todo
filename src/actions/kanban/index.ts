"use server";
import { db } from "@/lib/prisma";
import { ApiResponse, KanbanBoard, KanbanColumn, KanbanBoardSchema, KanbanColumnSchema } from "@actions/types";
import { getUser } from "@/lib/lucia";
import { z } from "zod";

export async function handleUserAuth<T>(): Promise<{ dbUser: any } | { error: ApiResponse<T> }> {
  const user = await getUser();
  if (!user) {
    return { error: { status: "error", message: "Unauthorized", data: [] } };
  }
  const dbUser = await db.user.findUnique({
    where: { email: user.email }
  });
  if (!dbUser) {
    return { error: { status: "error", message: "User not found", data: [] } };
  }
  return { dbUser };
}

export const getKanbanBoards = async (): Promise<ApiResponse<KanbanBoard>> => {
  try {
    const authResult = await handleUserAuth<KanbanBoard>();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    const boards = await db.kanbanBoard.findMany({
      where: { userId: dbUser.id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            todos: {
              where: { 
                isDeleted: false,
                userId: dbUser.id 
              },
              orderBy: { position: 'asc' },
              include: {
                labels: true,
                reminder: true,
                subTodos: {
                  where: { isDeleted: false }
                }
              }
            }
          }
        }
      }
    }) as unknown as KanbanBoard[]; // 轉換 Prisma 類型到自定義類型

    // If no boards exist, create a default board
    if (boards.length === 0) {
      const statusLabels = await db.label.findMany({
        where: { 
          type: 'STATUS',
          OR: [
            { name: 'Todo' },
            { name: 'In Progress' },
            { name: 'Done' }
          ]
        }
      });

      const defaultBoard = await db.kanbanBoard.create({
        data: {
          name: "My First Board",
          userId: dbUser.id,
          columns: {
            create: statusLabels.map((label, index) => ({
              name: label.name,
              position: index,
              labelId: label.id
            }))
          }
        },
        include: {
          columns: {
            orderBy: { position: 'asc' },
            include: {
              todos: {
                where: { isDeleted: false },
                orderBy: { position: 'asc' },
                include: {
                  labels: true,
                  reminder: true,
                  subTodos: {
                    where: { isDeleted: false }
                  }
                }
              }
            }
          }
        }
      }) as unknown as KanbanBoard;

      return { 
        status: "success", 
        message: "Default board created successfully", 
        data: [defaultBoard] 
      };
    }

    return { 
      status: "success", 
      message: "Kanban boards fetched successfully", 
      data: boards 
    };
  } catch (error) {
    return {
      status: "error",
      message: `${error}`,
      data: []
    }
  }
};

export const createKanbanBoard = async (values: z.infer<typeof KanbanBoardSchema>): Promise<ApiResponse<KanbanBoard>> => {
  try {
    const authResult = await handleUserAuth<KanbanBoard>();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    const validatedFields = KanbanBoardSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const board = await db.kanbanBoard.create({
      data: {
        ...validatedFields.data,
        userId: dbUser.id
      },
      include: { columns: true }
    }) as unknown as KanbanBoard; // 轉換類型

    return {
      status: "success",
      message: "Board created successfully",
      data: [board]
    };
  } catch (error) {
    return {
      status: "error",
      message: `${error}`,
      data: []
    };
  }
};

export const createKanbanColumn = async (
  boardId: string,
  values: z.infer<typeof KanbanColumnSchema>
): Promise<ApiResponse<KanbanColumn>> => {
  try {
    const authResult = await handleUserAuth<KanbanColumn>();
    if ('error' in authResult) return authResult.error;

    const validatedFields = KanbanColumnSchema.safeParse(values);
    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields", data: [] };
    }

    const column = await db.kanbanColumn.create({
      data: {
        ...validatedFields.data,
        boardId
      },
      include: { todos: true }
    }) as unknown as KanbanColumn; // 轉換類型

    return {
      status: "success",
      message: "Column created successfully",
      data: [column]
    };
  } catch (error) {
    return {
      status: "error",
      message: `${error}`,
      data: []
    };
  }
};

export const updateTodoPosition = async (
  todoId: string,
  columnId: string,
  newPosition: number
): Promise<ApiResponse<any>> => {
  try {
    const authResult = await handleUserAuth();
    if ('error' in authResult) return authResult.error;

    const updated = await db.todo.update({
      where: { id: todoId },
      data: { 
        position: newPosition,
        columnId: columnId
      }
    });

    return {
      status: "success",
      message: "Todo position updated successfully",
      data: [updated]
    };
  } catch (error) {
    return {
      status: "error",
      message: `${error}`,
      data: []
    }
  }
};

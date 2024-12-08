import "server-only";
import { db } from "@/lib/prisma";
import { handleError, handleUserAuth } from "../todo/utils";
import { KanbanSettings } from "@prisma/client";
import { ApiResponse } from "@actions/types";

export const getKanbanSettings = async (): Promise<ApiResponse<KanbanSettings>> => {
  try {
    const authResult = await handleUserAuth<KanbanSettings>();
    if ('error' in authResult) return authResult.error;
    const { dbUser } = authResult;

    let settings = await db.kanbanSettings.findUnique({
      where: { userId: dbUser.id },
      include: {
        columns: {
          orderBy: { position: 'asc' }
        }
      }
    });

    // If no settings exist, create default settings
    if (!settings) {
      const statusLabels = await db.label.findMany({
        where: { type: 'STATUS' }
      });

      settings = await db.kanbanSettings.create({
        data: {
          userId: dbUser.id,
          columns: {
            create: statusLabels.map((label, index) => ({
              labelId: label.id,
              position: index,
              isHidden: false
            }))
          }
        },
        include: {
          columns: {
            orderBy: { position: 'asc' }
          }
        }
      });
    }

    return { 
      status: "success", 
      message: "Kanban settings fetched successfully", 
      data: [settings] 
    };
  } catch (error) {
    // TODO: Change to use handleError
    return { status: "error", message: `${error}`, data: [] }
  }
};

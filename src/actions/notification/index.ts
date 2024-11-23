"use server"
import { db } from "@/lib/prisma";

async function createNotification({
  userId,
  message,
  type,
  todoId
}: {
  userId: string;
  message: string;
  type: string;
  todoId?: string;
}) {
  return await db.notification.create({
    data: {
      userId,
      message,
      type,
      todoId
    }
  });
}

async function getNotifications(userId: string) {
  return await db.notification.findMany({
    where: {
      userId,
      isRead: false
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      todo: true
    }
  });
}

async function markNotificationAsRead(notificationId: string) {
  return await db.notification.update({
    where: {
      id: notificationId
    },
    data: {
      isRead: true
    }
  });
}

export {
  createNotification,
  getNotifications,
  markNotificationAsRead,
}

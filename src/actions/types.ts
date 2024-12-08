import { z } from "zod";

export type ApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T[];
};

/**
 * Kanban actions
 */
export type KanbanSettings = {
  id: string;
  columns: {
    id: string;
    labelId: string;
    position: number;
    isHidden: boolean;
    limit?: number | null;
  }[];
};

/**
 * Label actions
 */
export const LABEL_TYPES = ['PRIORITY', 'CATEGORY', 'STATUS', 'CUSTOM'] as const;

// Schema
export const LabelSchema = z.object({
  name: z.string().min(1, "標籤名稱不能為空").max(50, "標籤名稱不能超過50個字符"),
  type: z.enum(LABEL_TYPES).default('CUSTOM'),
});

// Types
export type Label = {
  id: string;
  name: string;
  type: typeof LABEL_TYPES[number];
}

/**
 * Todo actions
 */ 
export const REMINDER_TYPES = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY'
} as const;

// Create a type from the values
export type ReminderType = typeof REMINDER_TYPES[keyof typeof REMINDER_TYPES];

export type ReminderSchedule = {
  id: string;
  isEnabled: boolean;
  startTime: Date;
  repeatType: ReminderType | null;
  repeatDays: string | null;
  repeatDate: number | null;
  repeatStart: Date | null;
  repeatEnd: Date | null;
  lastTriggered: Date | null;
  createdAt: Date;
  updatedAt: Date;
  todoId: string;
};

export type Todo = {
  id: string;
  title: string;
  description?: string;
  isDone: boolean;
  startDate?: Date;
  endDate?: Date;
  labels?: string[];
  subTodos?: Todo[];
  reminder?: ReminderSchedule | null;
};

export const ReminderSchema = z.object({
  isEnabled: z.boolean().default(true),
  startTime: z.date(),
  repeatType: z.enum([
    REMINDER_TYPES.NONE,
    REMINDER_TYPES.DAILY,
    REMINDER_TYPES.WEEKLY,
    REMINDER_TYPES.MONTHLY
  ]).nullable(),
  repeatDays: z.string().nullable(),
  repeatDate: z.number().min(1).max(31).nullable(),
  repeatStart: z.date().nullable(),
  repeatEnd: z.date().nullable(),
});

export const TodoSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字符"),
  description: z.string().max(300, '描述不能超過300個字符').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isDone: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
  reminder: ReminderSchema.optional(),
});

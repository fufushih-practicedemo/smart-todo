import "server-only";
import { getUser } from "@/lib/lucia";
import { z } from "zod";

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

export type ApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T[];
};

// Helper functions
export const handleError = (error: any, message: string): ApiResponse<Label> => {
  console.error(`${message}:`, error);
  return { status: "error", message, data: [] };
};

export const handleUserAuth = async () => {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};

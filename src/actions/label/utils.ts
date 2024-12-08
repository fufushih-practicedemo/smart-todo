import "server-only";
import { getUser } from "@/lib/lucia";
import { ApiResponse, Label } from "@actions/types";

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

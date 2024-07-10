"use server";

import OpenAI from 'openai';
import { Todo, ApiResponse } from './todo';  // 假設您的 Todo 和 ApiResponse 類型定義在這個文件中
import { getUser } from '@/lib/lucia';
import { prisma } from "@/lib/prisma";
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateTodoByGPT = async (description: string): Promise<ApiResponse<Omit<Todo, 'id' | 'isDone'>>> => {
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

    const promptPath = path.join(process.cwd(), 'src', 'lib', 'ai', 'prompt.txt');
    const promptTemplate = await fs.readFile(promptPath, 'utf-8');
    const prompt = promptTemplate.replace('[User Input]', description);

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const content = chatCompletion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const todoData = JSON.parse(content);

    if (todoData.startDate) {
      todoData.startDate = new Date(todoData.startDate);
    }
    if (todoData.endDate) {
      todoData.endDate = new Date(todoData.endDate);
    }

    if (todoData.subTodos) {
      todoData.subTodos = todoData.subTodos.map((subTodo: any) => ({
        ...subTodo,
        startDate: subTodo.startDate ? new Date(subTodo.startDate) : undefined,
        endDate: subTodo.endDate ? new Date(subTodo.endDate) : undefined,
      }));
    }

    return { status: "success", message: "Todo generated successfully", data: [todoData] };
  } catch (error) {
    console.error('Error generating todo:', error);
    return { status: "error", message: "Failed to generate todo", data: [] };
  }
};

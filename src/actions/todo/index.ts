"use server"

import { getTodos, getTodosWithSubTodos } from "./fetch";
import { createTodo, createSubTodo } from "./create";
import { updateTodo, toggleTodoStatus, restoreTodo, restoreTodoAndSubTodos, toggleTodoAndSubTodosStatus, updateTodoStatus } from "./update";
import { deleteTodo, deleteTodoAndSubTodos, getDeletedTodos, permanentDeleteTodoAndSubTodos } from "./delete";

export type { 
  Todo, 
  ApiResponse,
  ReminderType,
  ReminderSchedule, 
} from "./utils";

export {
  getTodos,
  getTodosWithSubTodos,
  createTodo,
  createSubTodo,
  toggleTodoStatus,
  restoreTodoAndSubTodos,
  toggleTodoAndSubTodosStatus,
  updateTodoStatus,
  restoreTodo,
  updateTodo,
  deleteTodo,
  deleteTodoAndSubTodos,
  permanentDeleteTodoAndSubTodos,
  getDeletedTodos,
};

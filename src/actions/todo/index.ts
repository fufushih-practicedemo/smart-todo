"use server"

import { getTodos, getTodosWithSubTodos } from "./fetch";
import { createTodo, createSubTodo } from "./create";
import { updateTodo, toggleTodoStatus, restoreTodo, restoreTodoAndSubTodos, toggleTodoAndSubTodosStatus } from "./update";
import { deleteTodo, deleteTodoAndSubTodos, getDeletedTodos } from "./delete";

export type { Todo } from "./utils";
export {
  getTodos,
  getTodosWithSubTodos,
  createTodo,
  createSubTodo,
  toggleTodoStatus,
  restoreTodoAndSubTodos,
  toggleTodoAndSubTodosStatus,
  restoreTodo,
  updateTodo,
  deleteTodo,
  deleteTodoAndSubTodos,
  getDeletedTodos
};

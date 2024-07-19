"use server"

import { getTodos, getTodosWithSubTodos } from "./fetch";
import { createTodo, createSubTodo } from "./create";
import { updateTodo, toggleTodoStatus, restoreTodo } from "./update";
import { deleteTodo, deleteTodoAndSubTodos, getDeletedTodos } from "./delete";

export type { Todo } from "./utils";
export {
  getTodos,
  getTodosWithSubTodos,
  createTodo,
  createSubTodo,
  toggleTodoStatus,
  restoreTodo,
  updateTodo,
  deleteTodo,
  deleteTodoAndSubTodos,
  getDeletedTodos
};

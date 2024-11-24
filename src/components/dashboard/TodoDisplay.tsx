'use client';

import TodoCard from "./TodoCard";
import TodoCreateDialog from "./TodoCreateDialog";
import { Todo, createSubTodo, createTodo, deleteTodoAndSubTodos, toggleTodoAndSubTodosStatus, updateTodo } from "@/actions/todo";

interface TodoDisplayProps {
  todos: Todo[];
}

const TodoDisplay: React.FC<TodoDisplayProps> = ({ todos }) => {
  const handleToggleStatus = async (id: string) => {
    const response = await toggleTodoAndSubTodosStatus(id);
    if (response.status !== "success") {
      console.error("Failed to toggle todo status:", response.message);
    }
  };

  const handleEdit = async (editedTodo: Todo) => {
    const todoWithReminder = {
      ...editedTodo,
      reminder: editedTodo.reminder ? {
        ...editedTodo.reminder,
        startTime: new Date(editedTodo.reminder.startTime),
        repeatStart: editedTodo.reminder.repeatStart ? new Date(editedTodo.reminder.repeatStart) : null,
        repeatEnd: editedTodo.reminder.repeatEnd ? new Date(editedTodo.reminder.repeatEnd) : null,
      } : undefined
    };
    
    const response = await updateTodo(todoWithReminder.id, todoWithReminder);
    if (response.status !== "success") {
      console.error("Failed to update todo:", response.message);
    }
  };

  const handleCreate = async (newTodo: Omit<Todo, 'id' | 'isDone'>) => {
    const todoWithFormattedReminder = {
      ...newTodo,
      reminder: newTodo.reminder ? {
        ...newTodo.reminder,
        startTime: new Date(newTodo.reminder.startTime),
        repeatStart: newTodo.reminder.repeatStart ? new Date(newTodo.reminder.repeatStart) : null,
        repeatEnd: newTodo.reminder.repeatEnd ? new Date(newTodo.reminder.repeatEnd) : null,
      } : undefined
    };
    const response = await createTodo(todoWithFormattedReminder);
    if (response.status !== "success") {
      console.error("Failed to create todo:", response.message);
    }
  };

  const handleCreateSubTodo = async (parentId: string, todo: Omit<Todo, 'id' | 'isDone'>) => {
    const todoWithFormattedReminder = {
      ...todo,
      reminder: todo.reminder ? {
        ...todo.reminder,
        startTime: new Date(todo.reminder.startTime),
        repeatStart: todo.reminder.repeatStart ? new Date(todo.reminder.repeatStart) : null,
        repeatEnd: todo.reminder.repeatEnd ? new Date(todo.reminder.repeatEnd) : null,
      } : undefined
    };
    const response = await createSubTodo(parentId, todoWithFormattedReminder);
    if (response.status !== "success") {
      console.error("Failed to create sub-todo:", response.message);
    }
  };

  const handleCancel = async (id: string) => {
    const response = await deleteTodoAndSubTodos(id);
    if (response.status !== "success") {
      console.error("Failed to delete todo:", response.message);
    }
  };
  

  return (
    <section className="w-full min-h-screen flex flex-col space-y-2 p-2">
      <TodoCreateDialog className="bottom-2 right-2" onCreate={handleCreate} />
      {todos.map((todo) => (
        <TodoCard 
          key={todo.id} 
          todo={todo} 
          onToggleStatus={handleToggleStatus} 
          onEdit={handleEdit}
          onCancel={handleCancel} 
          onCreateSub={handleCreateSubTodo}
        />
      ))}
    </section>
  )
}

export default TodoDisplay;

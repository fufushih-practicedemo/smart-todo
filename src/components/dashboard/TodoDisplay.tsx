'use client';

import AiGenerateTodoDialogButton from "./AiGenerateTodoDialogButton";
import TodoCard from "./TodoCard";
import TodoCreateDialog from "./TodoCreateDialog";
import { Todo, createSubTodo, createTodo, deleteTodo, toggleTodoStatus, updateTodo } from "@/actions/todo";

interface TodoDisplayProps {
  todos: Todo[];
}

const TodoDisplay: React.FC<TodoDisplayProps> = ({ todos }) => {
  const handleToggleStatus = async (id: string) => {
    const response = await toggleTodoStatus(id);
    if (response.status !== "success") {
      console.error("Failed to toggle todo status:", response.message);
    }
  };

  const handleEdit = async (editedTodo: Todo) => {
    const response = await updateTodo(editedTodo.id, editedTodo);
    if (response.status !== "success") {
      console.error("Failed to update todo:", response.message);
    }
  };

  const handleCreate = async (newTodo: Omit<Todo, 'id' | 'isDone'>) => {
    const response = await createTodo(newTodo);
    if (response.status !== "success") {
      console.error("Failed to create todo:", response.message);
    }
  };

  const handleCreateSubTodo = async (parentId: string, todo: Omit<Todo, 'id' | 'isDone'>) => {
    const response = await createSubTodo(parentId, todo);
    if (response.status !== "success") {
      console.error("Failed to create sub-todo:", response.message);
    }
  };

  const handleCancel = async (id: string) => {
    const response = await deleteTodo(id);
    if (response.status !== "success") {
      console.error("Failed to delete todo:", response.message);
    }
  };
  

  return (
    <section className="w-full min-h-screen flex flex-col space-y-2 p-2">
      <TodoCreateDialog className="bottom-2 right-2" onCreate={handleCreate} />
      <AiGenerateTodoDialogButton className="bottom-20 right-2" onCreate={handleCreate} />
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

'use client';

import { useState } from "react";
import TodoCard, { Todo } from "./TodoCard";
import TodoCreateDialog from "./TodoCreateDialog";

interface TodoDisplayProps {
  todos: Todo[];
}

const TodoDisplay: React.FC<TodoDisplayProps> = ({ todos: initialTodos }) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const handleToggleStatus = (id: string) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  const handleEdit = (editedTodo: Todo) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === editedTodo.id ? editedTodo : todo
      )
    );
  };

  const handleCreate = (newTodo: Omit<Todo, 'id' | 'isDone'>) => {
    const todo: Todo = {
      ...newTodo,
      id: Math.random().toString(36).substr(2, 9),
      isDone: false,
    };
    setTodos(prevTodos => [...prevTodos, todo]);
  };

  const handleCancel = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <section className="w-full min-h-screen flex flex-col space-y-2 p-2">
      <TodoCreateDialog onCreate={handleCreate} />
      {todos.map((todo) => (
        <TodoCard 
          key={todo.id} 
          todo={todo} 
          onToggleStatus={handleToggleStatus} 
          onEdit={handleEdit}
          onCancel={handleCancel} 
        />
      ))}
    </section>
  )
}

export default TodoDisplay

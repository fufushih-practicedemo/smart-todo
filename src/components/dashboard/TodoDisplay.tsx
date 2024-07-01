'use client';

import { CheckCircle2, Circle, Trash } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import TodoCard, { Todo } from "./TodoCard";

interface TodoDisplayProps {
  todos: Todo[];
}

const TodoDisplay: React.FC<TodoDisplayProps> = ({ todos: initialTodos }) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const today = new Date();

  const handleToggleStatus = (id: string) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  const handleCancel = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <section className="w-full min-h-screen flex flex-col space-y-2 p-2">
      {todos.map((todo) => {
        const endDate = todo.endDate ? new Date(todo.endDate) : undefined;
        const isExpired = endDate && endDate < today;
        const cardColor = isExpired ? "bg-gray-200 dark:bg-gray-700" : "";

        return (
          <TodoCard 
            key={todo.id} 
            todo={todo} 
            onToggleStatus={handleToggleStatus} 
            onCancel={handleCancel} 
          />
        );
      })}
    </section>
  )
}

export default TodoDisplay

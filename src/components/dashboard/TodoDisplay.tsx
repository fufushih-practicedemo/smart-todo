'use client';

import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Todo {
  id: string;
  title: string;
  isDone: boolean;
  startDate?: string;
  endDate?: string;
  labels?: string[];
}

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
          <Card 
            key={todo.id} 
            className={cn("shadow-md", cardColor, "cursor-pointer")}
            onClick={() => handleToggleStatus(todo.id)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {todo.isDone ? (
                  <CheckCircle2 className="text-green-500" />
                ) : (
                  <Circle className="text-gray-400" />
                )}
                <div>
                  <CardTitle className={cn(todo.isDone && "line-through")}>
                    {todo.title}
                  </CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    {todo.startDate && todo.endDate ? (
                      `${todo.startDate} - ${todo.endDate}`
                    ) : todo.endDate ? (
                      `Due: ${todo.endDate}`
                    ) : (
                      "No due date"
                    )}
                  </div>
                  {todo.labels && todo.labels.length > 0 && (
                    <div className="flex mt-2 space-x-1">
                      {todo.labels.map((label, index) => (
                        <Badge key={index} variant="secondary">{label}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge variant={isExpired ? "destructive" : "default"}>
                  {isExpired ? "Expired" : "Active"}
                </Badge>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(todo.id);
                  }}
                  className="text-sm text-red-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  )
}

export default TodoDisplay

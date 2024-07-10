'use client';

import { Todo, toggleTodoStatus } from "@/actions/todo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useState } from "react";

interface ArchivedTodoDisplayProps {
  completedTodos: Todo[];
}

const ArchivedTodoDisplay: React.FC<ArchivedTodoDisplayProps> = ({ completedTodos: initialCompletedTodos }) => {
  const [completedTodos, setCompletedTodos] = useState(initialCompletedTodos);

  const handleToggleStatus = async (id: string) => {
    const response = await toggleTodoStatus(id);
    if (response.status === "success") {
      setCompletedTodos(completedTodos.filter(todo => todo.id !== id));
    } else {
      console.error("Failed to toggle todo status:", response.message);
    }
  };

  return (
    <>
      {completedTodos.map((todo) => (
        <Card key={todo.id}>
          <CardContent className="flex flex-row justify-between item-center p-5">
            <div>
              <CardTitle>{todo.title}</CardTitle>
            </div>
            <Button onClick={() => handleToggleStatus(todo.id)} className="mt-2">
              標記為未完成
            </Button>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default ArchivedTodoDisplay;

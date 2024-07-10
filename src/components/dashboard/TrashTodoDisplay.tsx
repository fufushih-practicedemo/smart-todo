"use client";

import { Todo, restoreTodo } from "@/actions/todo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Button } from "@/components/ui/button";

interface TrashTodoDisplayProps {
  deletedTodos: Todo[];
}

const TrashTodoDisplay: React.FC<TrashTodoDisplayProps> = ({deletedTodos}) => {
  const handleRestore = async (id: string) => {
    const response = await restoreTodo(id);
    if (response.status !== "success") {
      console.error("restore failed")
    }
  };

  return (
    <>
      {deletedTodos.map((todo) => (
        <Card key={todo.id}className="w-full p-2">
          <CardContent className="flex flex-row items-center justify-between">
            <CardTitle>{todo.title}</CardTitle>
            <Button 
              type="button" 
              onClick={() => {
                handleRestore(todo.id);
              }}
            >
              恢復
            </Button>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export default TrashTodoDisplay

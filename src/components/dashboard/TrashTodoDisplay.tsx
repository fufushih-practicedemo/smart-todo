"use client";

import { Todo, restoreTodoAndSubTodos, permanentDeleteTodoAndSubTodos } from "@/actions/todo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Button } from "@/components/ui/button";

interface TrashTodoDisplayProps {
  deletedTodos: Todo[];
}

const TrashTodoDisplay: React.FC<TrashTodoDisplayProps> = ({ deletedTodos }) => {
  const handleRestore = async (id: string) => {
    const response = await restoreTodoAndSubTodos(id);
    if (response.status !== "success") {
      console.error("restore failed");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const response = await permanentDeleteTodoAndSubTodos(id);
    if (response.status !== "success") {
      console.error("permanent delete failed");
    }
  };

  return (
    <>
      {deletedTodos.map((todo) => (
        <Card key={todo.id} className="w-full p-2 mb-2">
          <CardContent className="flex flex-row items-center justify-between">
            <CardTitle>{todo.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => handleRestore(todo.id)}
              >
                恢復
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handlePermanentDelete(todo.id)}
              >
                永久刪除
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default TrashTodoDisplay;

'use client';

import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import TodoEditDialog from "./TodoEditDialog";
import { Todo } from "@/actions/todo";
import { format } from "date-fns";

// export interface Todo {
//   id: string;
//   title: string;
//   isDone: boolean;
//   startDate?: string;
//   endDate?: string;
//   labels?: string[];
//   subTodos?: Todo[]
// }

interface TodoCardProps {
  todo: Todo;
  onToggleStatus: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onCancel: (id: string) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onToggleStatus, onEdit, onCancel }) => {
  const today = new Date();
  const endDate = todo.endDate ? new Date() : undefined;
  const isExpired = endDate && endDate < today;
  const cardColor = isExpired ? "bg-gray-200 dark:bg-gray-700" : "";

  return (
    <Card 
      className={cn("shadow-md", cardColor, "cursor-pointer", "min-h-[6.875rem]")}
      onClick={() => onToggleStatus(todo.id)}
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
                `${format(todo.startDate, 'yyyy-MM-dd')} - ${format(todo.endDate, 'yyyy-MM-dd')}`
              ) : todo.endDate ? (
                `Due: ${format(todo.endDate, 'yyyy-MM-dd')}`
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
              onCancel(todo.id);
            }}
            className="text-sm text-red-500 hover:underline flex gap-2"
          >
            <Trash className="size-5" />
            刪除
          </button>
          
          <TodoEditDialog 
            todo={todo} 
            onEdit={onEdit}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoCard

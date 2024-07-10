'use client';

import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TodoEditDialog from "./TodoEditDialog";
import { Todo } from "@/actions/todo";
import { format } from "date-fns";
import TodoCreateSubDialog from "./TodoCreateSubDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  onCreateSub: (parentId: string, todo: Omit<Todo, 'id' | 'isDone'>) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onToggleStatus, onCreateSub, onEdit, onCancel }) => {
  const today = new Date();
  const endDate = todo.endDate ? new Date() : undefined;
  const isExpired = endDate && endDate < today;
  const cardColor = isExpired ? "bg-gray-200 dark:bg-gray-700" : "";
  console.log(todo);
  const renderNestedSubTodos = (subTodos: Todo[]) => (
    <ul className="space-y-2 ml-6">
      {subTodos.map((subTodo) => (
        <li key={subTodo.id}>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={subTodo.isDone}
              onChange={() => onToggleStatus(subTodo.id)}
              className="mr-2"
            />
            <span className={cn(subTodo.isDone && "line-through")}>{subTodo.title}</span>
          </div>
          {subTodo.subTodos && subTodo.subTodos.length > 0 && renderNestedSubTodos(subTodo.subTodos)}
        </li>
      ))}
    </ul>
  );

  return (
    <Card 
      className={cn("shadow-md", cardColor, "min-h-[6.875rem]")}
    >
      <CardContent className="p-4 flex flex-col items-center justify-between">
        <section className="flex flex-row w-full justify-between">
          <div className="flex items-center space-x-3">
            <button type="button" className="w-fit" onClick={() => onToggleStatus(todo.id)}>
              {todo.isDone ? (
                <CheckCircle2 className="text-green-500" />
              ) : (
                <Circle className="text-gray-400" />
              )}
            </button>
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
          <div className="flex flex-col items-stretch space-y-2">
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
            <TodoCreateSubDialog parentId={todo.id} onCreateSub={onCreateSub} />
          </div>
        </section>
        {todo.subTodos && todo.subTodos.length > 0 && (
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="subtodo">
              <AccordionTrigger className="w-full no-underline" onClick={(e) => e.stopPropagation()}>
                子任務: {todo.subTodos.length}
              </AccordionTrigger>
              <AccordionContent onClick={(e) => e.stopPropagation()}>
                {renderNestedSubTodos(todo.subTodos)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoCard

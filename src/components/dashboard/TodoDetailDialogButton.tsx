"use client"

import { Todo } from "@actions/types";
import { ReactNode, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

interface TodoDetailDialogButtonProps {
  todo: Todo;
  onToggleStatus: (id: string) => void;
  children: ReactNode;
}

const TodoDetailDialogButton: React.FC<TodoDetailDialogButtonProps> = ({todo, onToggleStatus, children}) => {
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
            <span className={`cursor-pointer ${subTodo.isDone ? "line-through" : ""}`}>
              {subTodo.title}
            </span>
          </div>
          {subTodo.subTodos && subTodo.subTodos.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-2">
              <AccordionItem value="subtodo">
                <AccordionTrigger className="text-sm">
                  子任務: {subTodo.subTodos.length}
                </AccordionTrigger>
                <AccordionContent>
                  {renderNestedSubTodos(subTodo.subTodos)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{todo.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p><strong>描述：</strong> {todo.description || '無描述'}</p>
          <p><strong>狀態：</strong> {todo.isDone ? '已完成' : '未完成'}</p>
          <p><strong>開始日期：</strong> {todo.startDate ? format(new Date(todo.startDate), 'yyyy-MM-dd') : '未設置'}</p>
          <p><strong>結束日期：</strong> {todo.endDate ? format(new Date(todo.endDate), 'yyyy-MM-dd') : '未設置'}</p>
          {todo.labels && todo.labels.length > 0 && (
            <div className="mt-2">
              <strong>標籤：</strong>
              {todo.labels.map((label, index) => (
                <Badge key={index} variant="secondary" className="ml-1">{label}</Badge>
              ))}
            </div>
          )}
          {todo.subTodos && todo.subTodos.length > 0 && (
            <div className="mt-4">
              <strong>子任務：</strong>
              {renderNestedSubTodos(todo.subTodos)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TodoDetailDialogButton;

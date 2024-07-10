'use client';

import { CalendarIcon, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Todo } from "@/actions/todo";

interface TodoCreateSubDialogProps {
  parentId: string;
  onCreateSub: (parentId: string, todo: Omit<Todo, 'id' | 'isDone'>) => void;
}

const todoSchema = z.object({
  title: z.string().min(2).max(50),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  labels: z.array(z.string()).optional(),
});

type TodoFormValues = z.infer<typeof todoSchema>;

const TodoCreateSubDialog: React.FC<TodoCreateSubDialogProps> = ({ parentId, onCreateSub }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      labels: [],
    }
  });

  const onSubmit = (values: TodoFormValues) => {
    onCreateSub(parentId, values);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="text-sm text-blue-500 hover:underline flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="size-5" />
          子任務
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>創建新的子任務</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>標題</FormLabel>
                  <FormControl>
                    <Input placeholder="輸入標題" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit">創建子任務</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default TodoCreateSubDialog;

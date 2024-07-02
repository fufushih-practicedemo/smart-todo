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

interface TodoCreateDialogProps {
  onCreate: (todo: Omit<Todo, 'id' | 'isDone'>) => void;
}

const todoSchema = z.object({
  title: z.string().min(2).max(50),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  labels: z.array(z.string()).optional(),
});

type TodoFormValues = z.infer<typeof todoSchema>;

const TodoCreateDialog: React.FC<TodoCreateDialogProps> = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      labels: [],
    }
  });

  const onSubmit = (values: TodoFormValues) => {
    onCreate(values);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建Todo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>創建新的代辦事項</DialogTitle>
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
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>開始日期</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format( field.value, 'yyyy-MM-dd') : <span>選擇日期</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>結束日期</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'yyyy-MM-dd') : <span>選擇日期</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="labels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>標籤</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((label, index) => (
                        <div key={index} className="flex items-center bg-gray-200 rounded-full px-3 py-1">
                          <span>{label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLabels = field.value?.filter((_, i) => i !== index);
                              field.onChange(newLabels);
                            }}
                            className="ml-2 text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <Input
                        placeholder="添加標籤"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const newLabel = input.value.trim();
                            if (newLabel && !field.value?.includes(newLabel)) {
                              field.onChange([...(field.value || []), newLabel]);
                              input.value = '';
                            }
                          }
                        }}
                        className="w-24 h-8"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">創建代辦事項</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default TodoCreateDialog

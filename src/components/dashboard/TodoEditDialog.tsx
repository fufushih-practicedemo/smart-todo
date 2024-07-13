'use client';

import { CalendarIcon, Edit, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { format, toDate } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Todo } from "@/actions/todo";
import { Textarea } from "../ui/textarea";

interface TodoEditDialogProps {
  todo: Todo;
  onEdit: (todo: Todo) => void
}


const todoSchema: z.ZodSchema<Todo> = z.object({
  id: z.string(),
  title: z.string().min(2).max(50),
  isDone: z.boolean(),
  description: z.string().max(300, '描述不能超過300個字符').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  labels: z.array(z.string()).optional(),
  subTodos: z.array(z.lazy(() => todoSchema)).optional(),
})


const TodoEditDialog: React.FC<TodoEditDialogProps> = ({todo, onEdit}) => {
  const [open, setOpen] = useState(false);
  const form = useForm<Todo>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      ...todo,
      labels: todo.labels || [],
    }
  });

  const onSubmit = (values: z.infer<typeof todoSchema>) => {
    onEdit(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="text-sm text-blue-500 hover:underline flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className="size-5" />
          修改
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯代辦事項</DialogTitle>
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
            <div className="flex flex-row gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => {
                  const { value, onChange} = field;
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
                                !value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {value ? format(value, 'yyyy-MM-dd') : <span>選擇日期</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={value}
                              onSelect={(date) => onChange(date)}
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
                  const { value, onChange} = field;
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
                                !value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {value ? format(value, 'yyyy-MM-dd') : <span>選擇日期</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={value}
                              onSelect={(date) => onChange(date)}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                return <FormItem>
                  <FormLabel>說明</FormLabel>
                  <FormControl>
                    <Textarea placeholder="請填寫說明，最多300字" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>;
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
            <Button type="submit">保存修改</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default TodoEditDialog

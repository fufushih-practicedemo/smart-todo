'use client';

import { CalendarIcon, Edit, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format, toDate } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Todo, ReminderSchedule } from "@/actions/todo";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  reminder: z.object({
    id: z.string(),
    isEnabled: z.boolean(),
    startTime: z.date(),
    repeatType: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']).nullable(),
    repeatDays: z.string().nullable(),
    repeatDate: z.number().nullable(),
    repeatStart: z.date().nullable(),
    repeatEnd: z.date().nullable(),
    lastTriggered: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    todoId: z.string(),
  }).nullable().optional() as z.ZodType<ReminderSchedule | null | undefined>
});

const TodoEditDialog: React.FC<TodoEditDialogProps> = ({todo, onEdit}) => {
  const [open, setOpen] = useState(false);
  const form = useForm<Todo>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      ...todo,
      labels: todo.labels || [],
      reminder: {
        id: todo.reminder?.id || '',
        isEnabled: todo.reminder?.isEnabled || false,
        startTime: todo.reminder?.startTime || new Date(),
        repeatType: todo.reminder?.repeatType || null,
        repeatDays: todo.reminder?.repeatDays || null,
        repeatDate: todo.reminder?.repeatDate || null,
        repeatStart: todo.reminder?.repeatStart || null,
        repeatEnd: todo.reminder?.repeatEnd || null,
        lastTriggered: todo.reminder?.lastTriggered || null,
        createdAt: todo.reminder?.createdAt || new Date(),
        updatedAt: todo.reminder?.updatedAt || new Date(),
        todoId: todo.reminder?.todoId || todo.id,
      }
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
            <FormField
              control={form.control}
              name="reminder.isEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提醒</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <span>啟用提醒</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("reminder.isEnabled") && (
              <>
                <FormField
                  control={form.control}
                  name="reminder.startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>提醒時間</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                          onChange={e => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminder.repeatType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>重複類型</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇重複類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">不重複</SelectItem>
                          <SelectItem value="DAILY">每天</SelectItem>
                          <SelectItem value="WEEKLY">每週</SelectItem>
                          <SelectItem value="MONTHLY">每月</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {form.watch("reminder.repeatType") === "WEEKLY" && (
                  <FormField
                    control={form.control}
                    name="reminder.repeatDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>重複日期</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="輸入星期幾 (1-7，用逗號分隔)"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("reminder.repeatType") === "MONTHLY" && (
                  <FormField
                    control={form.control}
                    name="reminder.repeatDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>每月幾號</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            max="31"
                            {...field}
                            value={field.value?.toString() || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
            <Button type="submit">保存修改</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default TodoEditDialog

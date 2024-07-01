'use client';

import { CalendarIcon, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Todo } from "./TodoCard";
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

interface TodoEditDialogProps {
  todo: Todo;
  onEdit: (todo: Todo) => void
}


const todoSchema: z.ZodSchema<Todo> = z.object({
  id: z.string(),
  title: z.string().min(2).max(50),
  isDone: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  labels: z.array(z.string()).optional(),
  subTodos: z.array(z.lazy(() => todoSchema)).optional(),
})


const TodoEditDialog: React.FC<TodoEditDialogProps> = ({todo, onEdit}) => {
  const form = useForm<Todo>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      ...todo
    }
  });

  const onSubmit = (values: z.infer<typeof todoSchema>) => {
    console.log(values)
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className="text-sm text-red-500 hover:underline flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className="size-5" />
          修改
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="title" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => {
                const { value, onChange} = field;
                return (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[280px] justify-start text-left font-normal",
                              !value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? format(value, 'yyyy-MM-dd') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={value ? toDate(value) : undefined}
                            onSelect={(date) => {
                              if(date) onChange(format(date, 'yyyy-MM-dd'));
                            }}
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
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {value ? format(value, 'yyyy-MM-dd') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={value ? toDate(value) : undefined}
                              onSelect={(date) => {
                                if(date) onChange(format(date, 'yyyy-MM-dd'));
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            <Button type="submit">Edit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default TodoEditDialog

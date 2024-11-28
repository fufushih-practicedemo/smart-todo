'use client';

import TodoCard from "./TodoCard";
import TodoCreateDialog from "./TodoCreateDialog";
import { Todo, createSubTodo, createTodo, deleteTodoAndSubTodos, toggleTodoAndSubTodosStatus, updateTodo } from "@/actions/todo";
import { startOfToday, startOfTomorrow, endOfWeek, addWeeks, isAfter, isBefore, startOfWeek } from 'date-fns';

interface TodoListDisplayProps {
  todos: Todo[];
}

interface GroupedTodos {
  overdue: Todo[];
  today: Todo[];
  tomorrow: Todo[];
  thisWeek: Todo[];
  nextWeek: Todo[];
  future: Todo[];
  noDueDate: Todo[];
}

const TodoListDisplay: React.FC<TodoListDisplayProps> = ({ todos }) => {
  const handleToggleStatus = async (id: string) => {
    const response = await toggleTodoAndSubTodosStatus(id);
    if (response.status !== "success") {
      console.error("Failed to toggle todo status:", response.message);
    }
  };

  const handleEdit = async (editedTodo: Todo) => {
    const todoWithReminder = {
      ...editedTodo,
      reminder: editedTodo.reminder ? {
        ...editedTodo.reminder,
        startTime: new Date(editedTodo.reminder.startTime),
        repeatStart: editedTodo.reminder.repeatStart ? new Date(editedTodo.reminder.repeatStart) : null,
        repeatEnd: editedTodo.reminder.repeatEnd ? new Date(editedTodo.reminder.repeatEnd) : null,
      } : undefined
    };
    
    const response = await updateTodo(todoWithReminder.id, todoWithReminder);
    if (response.status !== "success") {
      console.error("Failed to update todo:", response.message);
    }
  };

  const handleCreate = async (newTodo: Omit<Todo, 'id' | 'isDone'>) => {
    const todoWithFormattedReminder = {
      ...newTodo,
      reminder: newTodo.reminder ? {
        ...newTodo.reminder,
        startTime: new Date(newTodo.reminder.startTime),
        repeatStart: newTodo.reminder.repeatStart ? new Date(newTodo.reminder.repeatStart) : null,
        repeatEnd: newTodo.reminder.repeatEnd ? new Date(newTodo.reminder.repeatEnd) : null,
      } : undefined
    };
    const response = await createTodo(todoWithFormattedReminder);
    if (response.status !== "success") {
      console.error("Failed to create todo:", response.message);
    }
  };

  const handleCreateSubTodo = async (parentId: string, todo: Omit<Todo, 'id' | 'isDone'>) => {
    const todoWithFormattedReminder = {
      ...todo,
      reminder: todo.reminder ? {
        ...todo.reminder,
        startTime: new Date(todo.reminder.startTime),
        repeatStart: todo.reminder.repeatStart ? new Date(todo.reminder.repeatStart) : null,
        repeatEnd: todo.reminder.repeatEnd ? new Date(todo.reminder.repeatEnd) : null,
      } : undefined
    };
    const response = await createSubTodo(parentId, todoWithFormattedReminder);
    if (response.status !== "success") {
      console.error("Failed to create sub-todo:", response.message);
    }
  };

  const handleCancel = async (id: string) => {
    const response = await deleteTodoAndSubTodos(id);
    if (response.status !== "success") {
      console.error("Failed to delete todo:", response.message);
    }
  };

  const groupTodosByDate = (todos: Todo[]): GroupedTodos => {
    const today = startOfToday();
    const tomorrow = startOfTomorrow();
    const thisWeekEnd = endOfWeek(today);
    const nextWeekStart = startOfWeek(addWeeks(today, 1));
    const nextWeekEnd = endOfWeek(addWeeks(today, 1));

    return todos.reduce((groups: GroupedTodos, todo) => {
      const deadline = todo.endDate ? new Date(todo.endDate) : null;

      if (!deadline) {
        groups.noDueDate.push(todo);
      } else if (isBefore(deadline, today)) {
        groups.overdue.push(todo);
      } else if (isBefore(deadline, tomorrow)) {
        groups.today.push(todo);
      } else if (isBefore(deadline, startOfWeek(addWeeks(today, 1)))) {
        groups.thisWeek.push(todo);
      } else if (isBefore(deadline, nextWeekEnd)) {
        groups.nextWeek.push(todo);
      } else {
        groups.future.push(todo);
      }

      return groups;
    }, {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      nextWeek: [],
      future: [],
      noDueDate: []
    });
  };

  const groupedTodos = groupTodosByDate(todos);

  const TodoSection = ({ title, todos, className = "" }: { title: string; todos: Todo[]; className?: string }) => {
    if (todos.length === 0) return null;

    return (
      <div className="space-y-2">
        <h2 className={`text-lg font-semibold ${className}`}>{title}</h2>
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoCard 
              key={todo.id} 
              todo={todo} 
              onToggleStatus={handleToggleStatus} 
              onEdit={handleEdit}
              onCancel={handleCancel} 
              onCreateSub={handleCreateSubTodo}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="w-full min-h-screen flex flex-col space-y-4 p-2">
      <TodoCreateDialog className="bottom-2 right-2" onCreate={handleCreate} />
      
      <TodoSection 
        title="Overdue" 
        todos={groupedTodos.overdue} 
        className="text-red-600"
      />
      <TodoSection 
        title="Today" 
        todos={groupedTodos.today}
        className="text-blue-600"
      />
      <TodoSection 
        title="Tomorrow" 
        todos={groupedTodos.tomorrow}
      />
      <TodoSection 
        title="This Week" 
        todos={groupedTodos.thisWeek}
      />
      <TodoSection 
        title="Next Week" 
        todos={groupedTodos.nextWeek}
      />
      <TodoSection 
        title="Future" 
        todos={groupedTodos.future}
      />
      <TodoSection 
        title="No Due Date" 
        todos={groupedTodos.noDueDate}
        className="text-gray-600"
      />
    </section>
  );
};

export default TodoListDisplay;

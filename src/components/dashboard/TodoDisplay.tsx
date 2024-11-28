'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import TodoListDisplay from "./TodoListDisplay";
import TodoCalendarDisplay from "./TodoCalendarDisplay";
import { Todo } from '@/actions/todo';

interface TodoDisplayProps {
  todos: Todo[];
}

const TodoDisplay = ({ todos }: TodoDisplayProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <Button 
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
        <Button 
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </Button>
      </div>

      {viewMode === 'list' ? (
        <TodoListDisplay todos={todos} />
      ) : (
        <TodoCalendarDisplay todos={todos} />
      )}
    </div>
  );
};

export default TodoDisplay;

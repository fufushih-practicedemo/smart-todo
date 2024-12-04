'use client';

import { Todo, updateTodoStatus } from "@/actions/todo";
import { getLabels } from "@/actions/label";
import TodoCard from "./TodoCard";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState, useCallback } from 'react';

const DEFAULT_STATUS_LABELS = ['Todo', 'In Progress', 'Done'];

const DraggableTodoCard = ({ todo }: { todo: Todo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: todo.id,
    data: { type: 'todo', todo },
  });

  return (
    <div 
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      className="cursor-move touch-none"
      {...attributes}
      {...listeners}
    >
      <TodoCard
        todo={todo}
        onToggleStatus={() => {}}
        onEdit={() => {}}
        onCancel={() => {}}
        onCreateSub={() => {}}
      />
    </div>
  );
};

const StatusColumn = ({ 
  id, 
  title, 
  todos,
}: { 
  id: string; 
  title: string; 
  todos: Todo[];
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'column', status: id },
  });

  return (
    <div className="flex-1 min-w-[300px] max-w-[400px] bg-gray-50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
          {todos.length}
        </span>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-3 min-h-[200px] p-2 rounded-md border-2 ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-200'
        } transition-colors duration-200`}
      >
        {todos.map((todo) => (
          <DraggableTodoCard key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

const TodoKanbanDisplay: React.FC<{ todos: Todo[] }> = ({ todos: initialTodos }) => {
  const [todos, setTodos] = useState(initialTodos);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusLabels, setStatusLabels] = useState<string[]>(DEFAULT_STATUS_LABELS);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchLabels = async () => {
      const response = await getLabels();
      if (response.status === 'success') {
        const labels = response.data
          .filter(label => label.type === 'STATUS')
          .map(label => label.name);
        setStatusLabels(labels.length > 0 ? labels : DEFAULT_STATUS_LABELS);
      }
    };
    fetchLabels();
  }, []);

  const groupedTodos = useCallback(() => {
    return todos.reduce((groups: { [key: string]: Todo[] }, todo) => {
      const status = todo.labels?.find(label => statusLabels.includes(label)) || 'Todo';
      groups[status] = groups[status] || [];
      groups[status].push(todo);
      return groups;
    }, Object.fromEntries(statusLabels.map(label => [label, []])));
  }, [todos, statusLabels]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    
    if (!over?.data.current) return;
    
    const todo = todos.find(t => t.id === active.id);
    if (!todo) return;

    const targetStatus = over.data.current.status;
    if (!targetStatus || !statusLabels.includes(targetStatus)) {
      return;
    }

    const currentStatus = todo.labels?.find(label => statusLabels.includes(label));
    if (currentStatus === targetStatus) return;

    try {
      const response = await updateTodoStatus(todo.id, targetStatus);
      if (response.status === "success") {
        const updatedTodo = response.data[0];
        setTodos(prev => prev.map(t => 
          t.id === updatedTodo.id ? updatedTodo : t
        ));
      }
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  const grouped = groupedTodos();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto p-6 min-h-[calc(100vh-200px)]">
        {statusLabels.map((status) => (
          <StatusColumn 
            key={status}
            id={status}
            title={status}
            todos={grouped[status] || []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId && (
          <div className="shadow-lg transform scale-105 transition-transform">
            <TodoCard
              todo={todos.find(t => t.id === activeId)!}
              onToggleStatus={() => {}}
              onEdit={() => {}}
              onCancel={() => {}}
              onCreateSub={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default TodoKanbanDisplay;

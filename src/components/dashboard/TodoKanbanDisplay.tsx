'use client';

import { Todo, updateTodoStatus } from "@/actions/todo";
import { getLabels } from "@/actions/label";
import TodoCard from "./TodoCard";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';

interface TodoKanbanDisplayProps {
  todos: Todo[];
}
const SortableTodoCard = ({ todo }: { todo: Todo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: todo.id,
    data: {
      type: 'todo',
      todo,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
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

const KanbanColumn = ({ title, id, todos }: { title: string; id: string; todos: Todo[] }) => (
  <div className="flex-1 min-w-[300px] max-w-[400px] bg-gray-50 rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
        {todos.length}
      </span>
    </div>
    <div 
      data-status={id} 
      className="space-y-3 min-h-[200px] p-2 rounded-md border-2 border-dashed border-gray-200"
    >
      <SortableContext 
        items={todos.map(t => t.id)} 
        strategy={verticalListSortingStrategy}
      >
        {todos.map((todo) => (
          <SortableTodoCard key={todo.id} todo={todo} />
        ))}
      </SortableContext>
    </div>
  </div>
);

const DEFAULT_STATUS_LABELS = ['Todo', 'In Progress', 'Done'];

const TodoKanbanDisplay: React.FC<TodoKanbanDisplayProps> = ({ todos }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusLabels, setStatusLabels] = useState<string[]>(DEFAULT_STATUS_LABELS);
  
  useEffect(() => {
    const fetchStatusLabels = async () => {
      const response = await getLabels();
      if (response.status === 'success') {
        const labels = response.data
          .filter(label => label.type === 'STATUS')
          .map(label => label.name);
        setStatusLabels(labels.length > 0 ? labels : DEFAULT_STATUS_LABELS);
      }
    };
    fetchStatusLabels();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 的移動距離才觸發拖曳
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const groupTodosByStatus = (todos: Todo[]) => {
    return todos.reduce((groups: { [key: string]: Todo[] }, todo) => {
      const todoLabels = todo.labels || [];
      const statusLabel = todoLabels.find(label => statusLabels.includes(label)) || 'Todo';
      
      groups[statusLabel] = groups[statusLabel] || [];
      groups[statusLabel].push(todo);
      return groups;
    }, Object.fromEntries(statusLabels.map(label => [label, []])));
  };

  const findContainer = (element: HTMLElement | null) => {
    if (!element) return null;
    const container = element.closest('[data-status]');
    return container ? (container as HTMLElement).dataset.status : null;
  };

  const handleDragStart = ({ active }: { active: any }) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const todo = todos.find(t => t.id === active.id);
    if (!todo) return;

    const overContainer = over.data.current?.type === 'todo'
      ? findContainer(document.getElementById(String(over.id)))
      : over.id;

    if (!overContainer || todo.labels?.includes(String(overContainer))) return;

    try {
      const response = await updateTodoStatus(todo.id, String(overContainer));
      if (response.status !== "success") {
        console.error("Failed to update todo status:", response.message);
      }
    } catch (error) {
      console.error("Error updating todo status:", error);
    }

    setActiveId(null);
  };

  const groupedTodos = groupTodosByStatus(todos);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="flex gap-6 overflow-x-auto p-6 min-h-[calc(100vh-200px)]">
        {statusLabels.map((status) => (
          <KanbanColumn 
            key={status}
            title={status} 
            id={status} 
            todos={groupedTodos[status] || []} 
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

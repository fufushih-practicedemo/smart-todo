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
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
    <SortableContext 
      items={todos.map(t => t.id)} 
      strategy={verticalListSortingStrategy}
      id={id}
    >
      <div className="space-y-3 min-h-[200px] p-2">
        {todos.map((todo) => (
          <SortableTodoCard key={todo.id} todo={todo} />
        ))}
      </div>
    </SortableContext>
  </div>
);

const TodoKanbanDisplay: React.FC<TodoKanbanDisplayProps> = ({ todos }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusLabels, setStatusLabels] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchStatusLabels = async () => {
      const response = await getLabels();
      if (response.status === 'success') {
        const labels = response.data.filter(label => label.type === 'STATUS').map(label => label.name);
        setStatusLabels(labels);
      }
    };
    fetchStatusLabels();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const groupTodosByStatus = (todos: Todo[]) => {
    return todos.reduce((groups: { [key: string]: Todo[] }, todo) => {
      // Since todo.labels is already an array of label names, 
      // we just need to find if any of them match our status labels
      const statusLabel = todo.labels?.find(labelName => 
        statusLabels.includes(labelName)
      ) || statusLabels[0] || 'Todo';
      
      if (!groups[statusLabel]) {
        groups[statusLabel] = [];
      }
      groups[statusLabel].push(todo);
      return groups;
    }, statusLabels.reduce((acc, label) => ({ ...acc, [label]: [] }), {}));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const todo = todos.find(t => t.id === active.id);
    if (!todo) return;

    const container = over.data.current?.sortable?.containerId || over.id;
    const newStatus = container;
    
    const response = await updateTodoStatus(todo.id, newStatus);

    if (response.status !== "success") {
      console.error("Failed to update todo status:", response.message);
    }

    setActiveId(null);
  };

  const groupedTodos = groupTodosByStatus(todos);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={({ active }) => setActiveId(String(active.id))}
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

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
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState, useCallback } from 'react';

// 定義常數
const DEFAULT_STATUS_LABELS = ['Todo', 'In Progress', 'Done'];

// 可拖曳的 Todo 卡片元件
const DraggableTodoCard = ({ todo }: { todo: Todo }) => {
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

  return (
    <div 
      ref={setNodeRef} 
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
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

// 狀態列元件
const StatusColumn = ({ 
  id, 
  title, 
  todos, 
  isOver 
}: { 
  id: string; 
  title: string; 
  todos: Todo[]; 
  isOver: boolean;
}) => (
  <div 
    id={`column-${id}`}
    data-status={id}
    className="flex-1 min-w-[300px] max-w-[400px] bg-gray-50 rounded-lg p-4 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
        {todos.length}
      </span>
    </div>
    <div 
      className={`space-y-3 min-h-[200px] p-2 rounded-md border-2 ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-200'
      } transition-colors duration-200`}
    >
      <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {todos.map((todo) => (
          <DraggableTodoCard key={todo.id} todo={todo} />
        ))}
      </SortableContext>
    </div>
  </div>
);

// 主要元件
const TodoKanbanDisplay: React.FC<{ todos: Todo[] }> = ({ todos: initialTodos }) => {
  const [todos, setTodos] = useState(initialTodos);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusLabels, setStatusLabels] = useState<string[]>(DEFAULT_STATUS_LABELS);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  // 初始化感應器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 獲取狀態標籤
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

  // 按狀態分組 Todos
  const groupedTodos = useCallback(() => {
    return todos.reduce((groups: { [key: string]: Todo[] }, todo) => {
      const status = todo.labels?.find(label => statusLabels.includes(label)) || 'Todo';
      groups[status] = groups[status] || [];
      groups[status].push(todo);
      return groups;
    }, Object.fromEntries(statusLabels.map(label => [label, []])));
  }, [todos, statusLabels]);

  // 拖曳事件處理
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setActiveColumn(over?.id ? String(over.id) : null);
  };

  const findContainer = (overId: string | null): string | null => {
    if (!overId) return null;
    
    // 移除可能的 'column-' 前綴
    const cleanId = overId.replace('column-', '');
    
    // 直接檢查是否為有效的狀態標籤
    if (statusLabels.includes(cleanId)) {
      return cleanId;
    }
    
    // 如果不是狀態標籤，查找最近的容器
    const element = document.getElementById(overId);
    if (!element) return null;

    const container = element.closest('[data-status]');
    if (!container) return null;

    const status = container.getAttribute('data-status');
    return status && statusLabels.includes(status) ? status : null;
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const todo = todos.find(t => t.id === active.id);
    if (!todo) return;

    // 獲取目標狀態
    const targetStatus = findContainer(over.id?.toString());
    console.log('Drag end:', { 
      overId: over.id, 
      targetStatus,
      activeId: active.id 
    });

    if (!targetStatus) {
      console.error('No valid target status found');
      return;
    }

    // 檢查是否為相同狀態
    const currentStatus = todo.labels?.find(label => statusLabels.includes(label));
    if (currentStatus === targetStatus) return;

    try {
      const response = await updateTodoStatus(todo.id, targetStatus);
      if (response.status === "success") {
        setTodos(prev => prev.map(t => 
          t.id === response.data[0].id ? response.data[0] : t
        ));
      } else {
        console.error("Failed to update todo status:", response.message);
      }
    } catch (error) {
      console.error("Error updating todo status:", error);
    } finally {
      setActiveId(null);
      setActiveColumn(null);
    }
  };

  const grouped = groupedTodos();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto p-6 min-h-[calc(100vh-200px)]">
        {statusLabels.map((status) => (
          <StatusColumn 
            key={status}
            id={status}
            title={status}
            todos={grouped[status] || []}
            isOver={activeColumn === status}
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

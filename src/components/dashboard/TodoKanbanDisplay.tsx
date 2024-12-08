'use client';

import { updateTodoPosition } from "@actions/kanban";
import { KanbanBoard, Todo } from "@actions/types";
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
import { useState, useEffect } from 'react';
import { getKanbanBoards, createKanbanBoard } from "@actions/kanban";
import KanbanBoardSelector from './KanbanBoardSelector';
import { toast } from "sonner";

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

const KanbanColumn = ({ 
  column,
  todos,
}: { 
  column: KanbanBoard['columns'][0];
  todos: Todo[];
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  return (
    <div className="flex-1 min-w-[300px] max-w-[400px] bg-gray-50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{column.name}</h2>
        <div className="flex gap-2 items-center">
          {column.wipLimit && (
            <span className="text-sm text-gray-500">
              {todos.length}/{column.wipLimit}
            </span>
          )}
          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
            {todos.length}
          </span>
        </div>
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

interface TodoKanbanDisplayProps {
  todos: Todo[];
}

const TodoKanbanDisplay: React.FC<TodoKanbanDisplayProps> = ({ todos: initialTodos }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<KanbanBoard | undefined>();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeKanban = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getKanbanBoards();
        if (!mounted) return;

        if (response.status === 'success' && response.data.length > 0) {
          setBoards(response.data);
          const firstBoard = response.data[0];
          setSelectedBoard(firstBoard);

          // 使用 Set 來優化查找效率
          const validColumnIds = new Set(firstBoard.columns.map(col => col.id));
          const boardTodos = initialTodos
            .filter(todo => todo.columnId && validColumnIds.has(todo.columnId))
            .map(todo => ({
              ...todo,
              position: typeof todo.position === 'number' ? todo.position : 0
            }))
            .sort((a, b) => a.position - b.position);

          setTodos(boardTodos);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load kanban boards');
          toast.error('Failed to load kanban boards');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeKanban();
    return () => { mounted = false; };
  }, [initialTodos]);

  // 處理看板選擇
  const handleBoardSelect = (board: KanbanBoard) => {
    setSelectedBoard(board);
    const validColumnIds = new Set(board.columns.map(col => col.id));
    const boardTodos = initialTodos
      .filter(todo => todo.columnId && validColumnIds.has(todo.columnId))
      .map(todo => ({
        ...todo,
        position: typeof todo.position === 'number' ? todo.position : 0
      }))
      .sort((a, b) => a.position - b.position);
    setTodos(boardTodos);
  };

  const handleCreateBoard = async () => {
    const name = prompt('Enter board name:');
    if (!name) return;

    const response = await createKanbanBoard({ name });
    if (response.status === 'success') {
      const newBoard = response.data[0];
      setBoards(prev => [...prev, newBoard]);
      handleBoardSelect(newBoard); // 自動選擇新建立的看板
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    
    if (!over?.data.current || !selectedBoard) return;
    
    const draggedTodo = todos.find(t => t.id === active.id);
    if (!draggedTodo) return;

    const targetColumnId = over.data.current.columnId;
    if (!targetColumnId) return;

    const sourceColumnId = draggedTodo.columnId;
    const targetColumn = selectedBoard.columns.find(col => col.id === targetColumnId);
    
    if (!targetColumn) return;

    // WIP 限制檢查
    if (sourceColumnId !== targetColumnId) {
      const columnTodos = todos.filter(t => t.columnId === targetColumnId);
      if (targetColumn.wipLimit && columnTodos.length >= targetColumn.wipLimit) {
        toast.error(`Column "${targetColumn.name}" has reached its limit of ${targetColumn.wipLimit} items`);
        return;
      }
    }

    try {
      // 計算新位置
      const targetTodos = todos.filter(t => t.columnId === targetColumnId);
      const newPosition = targetTodos.length;

      const response = await updateTodoPosition(draggedTodo.id, targetColumnId, newPosition);
      
      if (response.status === "success") {
        setTodos(prev => {
          const updated = prev.map(t => {
            if (t.id === draggedTodo.id) {
              return { ...t, columnId: targetColumnId, position: newPosition };
            }
            return t;
          });
          return updated.sort((a, b) => 
            a.columnId === b.columnId ? (a.position ?? 0) - (b.position ?? 0) : 0
          );
        });
      }
    } catch (error) {
      toast.error("Failed to update todo position");
      console.error("Error updating todo position:", error);
    }
  };

  if (!selectedBoard) {
    return (
      <div className="p-6">
        <KanbanBoardSelector
          boards={boards}
          selectedBoard={selectedBoard}
          onSelectBoard={handleBoardSelect}
          onCreateBoard={handleCreateBoard}
        />
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-gray-500">
            {boards.length === 0
              ? "Create your first board to get started"
              : "Select a board to view"}
          </p>
        </div>
      </div>
    );
  }

  // 渲染加載狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-gray-500">Loading boards...</div>
      </div>
    );
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <KanbanBoardSelector
        boards={boards}
        selectedBoard={selectedBoard}
        onSelectBoard={handleBoardSelect}
        onCreateBoard={handleCreateBoard}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto p-6 min-h-[calc(100vh-200px)]">
          {selectedBoard.columns.map((column) => (
            <KanbanColumn 
              key={column.id}
              column={column}
              todos={todos.filter(todo => todo.columnId === column.id)
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))}
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
    </div>
  );
};

export default TodoKanbanDisplay;

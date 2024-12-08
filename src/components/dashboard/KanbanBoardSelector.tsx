'use client';

import { KanbanBoard } from "@/actions/types";
import { useState } from "react";
import { Plus } from "lucide-react";

interface BoardSelectorProps {
  boards: KanbanBoard[];
  selectedBoard?: KanbanBoard;
  onSelectBoard: (board: KanbanBoard) => void;
  onCreateBoard: () => void;
}

const KanbanBoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  selectedBoard,
  onSelectBoard,
  onCreateBoard
}) => {
  return (
    <div className="flex gap-2 p-4 overflow-x-auto">
      {boards.map((board) => (
        <button
          key={board.id}
          onClick={() => onSelectBoard(board)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium
            transition-colors duration-200
            ${board.id === selectedBoard?.id
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
          `}
        >
          {board.name}
          <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full text-xs">
            {board.columns.reduce((sum, col) => sum + col.todos.length, 0)}
          </span>
        </button>
      ))}
      
      <button
        onClick={onCreateBoard}
        className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 
          text-gray-700 hover:bg-gray-200 flex items-center gap-1"
      >
        <Plus className="w-4 h-4" />
        New Board
      </button>
    </div>
  );
};

export default KanbanBoardSelector;

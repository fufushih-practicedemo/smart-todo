'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Plus } from 'lucide-react';
import { Todo } from '@/actions/todo';
import { cn } from '@/lib/utils';

interface AiGenerateTodoDialogButtonProps {
  onCreate: (todo: Omit<Todo, 'id' | 'isDone'>) => void;
  className?: string;
}

const AiGenerateTodoDialogButton: React.FC<AiGenerateTodoDialogButtonProps> = ({ className, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedTodo, setGeneratedTodo] = useState<Omit<Todo, 'id' | 'isDone'> | null>(null);

  const generateTodo = async () => {
    // 這裡應該調用 ChatGPT API
    // 為了示例,我們暫時使用一個模擬的響應
    const mockResponse = {
      title: "完成項目報告",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一週後
      labels: ["工作", "重要"]
    };
    setGeneratedTodo(mockResponse);
  };

  const handleCreate = () => {
    if (generatedTodo) {
      onCreate(generatedTodo);
      setOpen(false);
      setPrompt('');
      setGeneratedTodo(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button 
        className={cn("fixed rounded-full w-16 h-16 shadow-lg items-center justify-center", className)}
      >
          <Bot className="size-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>自動創建待辦事項</DialogTitle>
          <DialogDescription>
            輸入描述,我們將為您生成一個待辦事項。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompt" className="text-right">
              描述
            </Label>
            <Textarea
              id="prompt"
              className="col-span-3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          {generatedTodo && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">生成結果</Label>
              <div className="col-span-3">
                <p>標題: {generatedTodo.title}</p>
                <p>開始日期: {generatedTodo.startDate?.toLocaleDateString()}</p>
                <p>結束日期: {generatedTodo.endDate?.toLocaleDateString()}</p>
                <p>標籤: {generatedTodo.labels?.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={generateTodo} disabled={!prompt}>
            生成
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!generatedTodo}>
            創建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiGenerateTodoDialogButton;

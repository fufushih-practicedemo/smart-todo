'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateTodoByGPT } from "@/actions/ai";
import { createTodo, createSubTodo, Todo } from "@/actions/todo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GeneratedTodo = Omit<Todo, 'id' | 'isDone'>;

const GeneratorDisplay = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generatedTodo, setGeneratedTodo] = useState<GeneratedTodo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await generateTodoByGPT(prompt);
      if (response.status === "success" && response.data.length > 0) {
        setGeneratedTodo(response.data[0]);
        setConversation([...conversation, { role: 'user', content: prompt }, { role: 'assistant', content: JSON.stringify(response.data[0], null, 2) }]);
      } else {
        console.error("Failed to generate todo:", response.message);
      }
    } catch (error) {
      console.error("Error in AI todo generation:", error);
    }
    setIsLoading(false);
    setPrompt(''); // 清空輸入欄
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '未設置';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  const TodoPreview = ({ todo }: { todo: GeneratedTodo }) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{todo.title}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4" />
          <span>{formatDate(todo.startDate?.toString())} - {formatDate(todo.endDate?.toString())}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        {todo.labels?.map((label, index) => (
          <Badge key={index} variant="secondary">{label}</Badge>
        ))}
      </div>
      {todo.subTodos && todo.subTodos.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">子任務：</h4>
          <ul className="space-y-2">
            {todo.subTodos.map((subTodo, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{subTodo.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const handleCreate = async () => {
    if (!generatedTodo) return;
    setIsDialogOpen(false);

    try {
      const createResponse = await createTodo(generatedTodo);
      if (createResponse.status === "success") {
        const createdTodo = createResponse.data[0];
        if (generatedTodo.subTodos) {
          for (const subTodo of generatedTodo.subTodos) {
            await createSubTodo(createdTodo.id, subTodo);
          }
        }
        console.log("Todo created successfully with subtodos");
        router.push('/dashboard/inbox');
      } else {
        console.error("Failed to create AI generated todo:", createResponse.message);
      }
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleAdjust = async () => {
    if (!generatedTodo) return;

    setIsLoading(true);
    try {
      const adjustPrompt = `請根據以下任務進行調整: ${JSON.stringify(generatedTodo)}. 調整建議: ${prompt}`;
      const response = await generateTodoByGPT(adjustPrompt);
      if (response.status === "success" && response.data.length > 0) {
        setGeneratedTodo(response.data[0]);
        setConversation([...conversation, { role: 'user', content: adjustPrompt }, { role: 'assistant', content: JSON.stringify(response.data[0], null, 2) }]);
      } else {
        console.error("Failed to adjust todo:", response.message);
      }
    } catch (error) {
      console.error("Error in AI todo adjustment:", error);
    }
    setIsLoading(false);
    setPrompt(''); // 清空輸入欄
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>輸入</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="請輸入任務描述或調整建議"
              className="mb-4"
            />
            <Button onClick={generatedTodo ? handleAdjust : handleGenerate} disabled={isLoading}>
              {isLoading ? '處理中...' : (generatedTodo ? '調整任務' : '生成任務')}
            </Button>
            {generatedTodo && (
              <Button onClick={() => setIsDialogOpen(true)} className="ml-2">
                創建任務
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>預覽</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedTodo ? (
              <TodoPreview todo={generatedTodo} />
            ) : (
              <p className="text-gray-500">尚未生成任務</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>對話歷史</CardTitle>
        </CardHeader>
        <CardContent>
          {conversation.map((message, index) => (
            <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
              <strong>{message.role === 'user' ? '用戶:' : 'AI:'}</strong>
              <pre className="whitespace-pre-wrap">{message.content}</pre>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認創建任務</DialogTitle>
            <DialogDescription>
              您確定要創建這個任務嗎？創建後將導航到收件箱頁面。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleCreate}>確認創建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratorDisplay;

"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Nav from "./Nav";
import { Inbox, Send, File, Archive, ArchiveX, Trash2, Trash, Home } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import TodoDisplay from "./TodoDisplay";

const DUMMY_TODO = [
  {
    id: "1",
    title: "完成專案報告",
    isDone: false,
    startDate: "2024-02-20",
    endDate: "2024-02-28",
    labels: ["工作", "重要"]
  },
  {
    id: "2",
    title: "健身",
    isDone: true,
    startDate: "2024-02-25",
    endDate: "2024-02-25",
    labels: ["健康"]
  },
  {
    id: "3",
    title: "閱讀新書",
    isDone: false,
    labels: ["個人發展"]
  },
  {
    id: "4",
    title: "繳電費",
    isDone: false,
    endDate: "2023-12-31",
    labels: ["家庭"]
  },
  {
    id: "5",
    title: "準備週末旅行",
    isDone: false,
    startDate: "2024-03-01",
    endDate: "2024-03-03",
    labels: ["娛樂", "計劃"]
  }
];

interface TodoProps {}

const Todo: React.FC<TodoProps> = ({}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30}>
          <Nav
            links={[
              {
                title: "Home",
                label: "128",
                icon: Home,
              },
              {
                title: "Inbox",
                label: "128",
                icon: Inbox,
              },
              {
                title: "Trash",
                label: "",
                icon: Trash,
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
              },
            ]}
          />  
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={70}>
          <TodoDisplay 
            todos={DUMMY_TODO}    
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}

export default Todo

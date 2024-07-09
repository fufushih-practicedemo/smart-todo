"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Nav from "./Nav";
import { Inbox, Send, File, Archive, ArchiveX, Trash2, Trash, Home } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import TodoDisplay from "./TodoDisplay";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

interface TodoDashboardProps {}

const TodoDashboard: React.FC<PropsWithChildren<TodoDashboardProps>> = ({children}) => {
  const pathname = usePathname();
  
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30}>
          <Nav
            currentPath={pathname}
            links={[
              {
                title: "Home",
                label: "",
                icon: Home,
                href: "",
              },
              {
                title: "Inbox",
                label: "",
                icon: Inbox,
                href: "inbox",
              },
              {
                title: "Trash",
                label: "",
                icon: Trash,
                href: "trash",
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                href: "archive",
              },
            ]}
          />  
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={70}>
          {
            children
          }
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}

export default TodoDashboard

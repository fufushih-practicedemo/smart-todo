"use client";

import Nav from "./Nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { useNavigation } from "../providers/NavigationProvider";

interface TodoDashboardProps {}

const TodoDashboard: React.FC<PropsWithChildren<TodoDashboardProps>> = ({children}) => {
  const pathname = usePathname();
  const { links } = useNavigation();
  
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen">
        <Nav
          currentPath={pathname}
          links={links}
        />
        <div className="flex-1 p-4">
          {children}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default TodoDashboard;

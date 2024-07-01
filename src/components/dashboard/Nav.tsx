'use client';

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { useState } from "react";

interface NavProps {
  links: {
    title: string
    label?: string
    icon: LucideIcon
  }[];
  activeIndex?: number
  onActiveChange?: (index: number) => void
}

const Nav: React.FC<NavProps> = ({links, activeIndex: externalActiveIndex, onActiveChange}) => {
  const [activeIndex, setActiveIndex] = useState(externalActiveIndex ?? 0);

  const handleClick = (index: number) => {
    setActiveIndex(index);
    onActiveChange?.(index);
  }

  return (
    <div className="group flex flex-col p-2">
      <nav className="flex flex-col gap-4 py-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href="#"
            onClick={() => handleClick(index)}
            className={cn(
              buttonVariants({ variant: activeIndex === index ? "default" : "ghost", size: "sm" }),
              activeIndex === index &&
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
              "justify-start w-full"
            )}
          >
            <link.icon className="mr-2 h-4 w-4" />
            <p>{link.title}</p>
            
            {link.label && (
              <span
                className={cn(
                  "ml-auto",
                  activeIndex === index &&
                    "text-background dark:text-white"
                )}
              >
                {link.label}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Nav

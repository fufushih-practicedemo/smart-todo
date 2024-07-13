'use client';

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { useState } from "react";

interface NavProps {
  currentPath?: string;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    href?: string;
  }[];
  activeIndex?: number
  onActiveChange?: (index: number) => void
}

const Nav: React.FC<NavProps> = ({currentPath = "", links, activeIndex: externalActiveIndex, onActiveChange}) => {
  const handleClick = (index: number) => {
    onActiveChange?.(index);
  }

  return (
    <div className="group flex flex-col p-2">
      <nav className="flex flex-col gap-4 py-2">
        {links.map((link, index) => {
          const fullHref = link.href === "" ? "/dashboard" : `/dashboard/${link.href}`;
          const isActive = fullHref === currentPath;

          return (
            <Link
              key={index}
              href={fullHref}
              onClick={() => handleClick(index)}
              className={cn(
                buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                isActive &&
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
                    isActive &&
                      "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  )
}

export default Nav

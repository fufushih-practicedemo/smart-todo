'use client';

import { LucideIcon, Home, Inbox, Trash, Bot, Archive, Tag } from "lucide-react";
import { createContext, useContext } from "react";

interface NavLink {
  title: string;
  label?: string;
  icon: LucideIcon;
  href?: string;
}

interface NavigationContextType {
  links: NavLink[];
}

const navigationLinks = [
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
    title: "Tags",
    label: "",
    icon: Tag,
    href: "tags",
  },
  {
    title: "Trash",
    label: "",
    icon: Trash,
    href: "trash",
  },
  {
    title: "Generator",
    label: "",
    icon: Bot,
    href: "generator",
  },
  {
    title: "Archive",
    label: "",
    icon: Archive,
    href: "archive",
  },
];

const NavigationContext = createContext<NavigationContextType>({ links: [] });

export const useNavigation = () => useContext(NavigationContext);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  return (
    <NavigationContext.Provider value={{ links: navigationLinks }}>
      {children}
    </NavigationContext.Provider>
  );
}

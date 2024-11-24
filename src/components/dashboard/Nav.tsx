'use client';

import { LucideIcon } from "lucide-react";
import NavContent from "./NavContent";

interface NavProps {
  currentPath?: string;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    href?: string;
  }[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
}

const Nav: React.FC<NavProps> = ({ currentPath = "", links, onActiveChange }) => {
  return (
    <div className="hidden md:flex group flex-col p-2">
      <NavContent 
        currentPath={currentPath}
        links={links}
        onActiveChange={onActiveChange}
      />
    </div>
  );
};

export default Nav;

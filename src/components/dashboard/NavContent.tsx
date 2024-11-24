import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface NavContentProps {
  currentPath?: string;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    href?: string;
  }[];
  onActiveChange?: (index: number) => void;
  className?: string;
}

const NavContent = ({
  currentPath = "",
  links,
  onActiveChange,
  className,
}: NavContentProps) => {
  return (
    <nav className={cn("flex flex-col gap-4", className)}>
      {links.map((link, index) => {
        const fullHref = link.href === "" ? "/dashboard" : `/dashboard/${link.href}`;
        const isActive = fullHref === currentPath;

        return (
          <Link
            key={index}
            href={fullHref}
            onClick={() => onActiveChange?.(index)}
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
                  isActive && "text-background dark:text-white"
                )}
              >
                {link.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavContent;

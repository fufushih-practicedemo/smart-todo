'use client';

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavContent from "./NavContent";
import { useNavigation } from "../providers/NavigationProvider";
import { usePathname } from "next/navigation";

const MobileNav = () => {
  const { links } = useNavigation();
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden px-2">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[280px]">
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <NavContent
          currentPath={pathname}
          links={links}
          className="pt-6"
        />
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;

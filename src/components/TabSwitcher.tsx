"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabSwitcherProps {
  SignUpTabContent: React.ReactNode;
  SignInTabContent: React.ReactNode;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ SignUpTabContent, SignInTabContent }) => {
  return (
    <Tabs className="max-w-[500px]" defaultValue="sign-in">
      <TabsList>
        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
      </TabsList>

      <TabsContent value="sign-up" className="h-[25rem]">
        {SignUpTabContent}
      </TabsContent>
      <TabsContent value="sign-in" className="h-[25rem]">
        {SignInTabContent}
      </TabsContent>
    </Tabs>
  )
}

export default TabSwitcher

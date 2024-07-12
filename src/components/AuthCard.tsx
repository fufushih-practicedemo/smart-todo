"use client"

import GoogleOAuthButton from "./GoogleOAuthButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface AuthCardProps {
  SignUpTabContent: React.ReactNode;
  SignInTabContent: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ SignUpTabContent, SignInTabContent }) => {
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

export default AuthCard;

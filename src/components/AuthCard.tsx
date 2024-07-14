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
      <TabsList className="w-full">
        <TabsTrigger value="sign-up" className="w-[50%]">Sign Up</TabsTrigger>
        <TabsTrigger value="sign-in" className="w-[50%]">Sign In</TabsTrigger>
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

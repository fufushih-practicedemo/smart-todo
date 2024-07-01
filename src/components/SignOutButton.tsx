'use client';

import { logOut } from "@/actions/auth";
import { Button } from "./ui/button";

interface SignOutButtonProps {
  children: React.ReactNode;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({children}) => {
  return (
    <Button onClick={() => {logOut()}}>
      {children}
    </Button>
  )
}

export default SignOutButton

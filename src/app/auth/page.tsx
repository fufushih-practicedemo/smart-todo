"use client";
import GoogleOAuthButton from "@/components/GoogleOAuthButton"
import SignInForm from "@/components/SignInForm"
import SignUpForm from "@/components/SignUpForm"
import TabSwitcher from "@/components/TabSwitcher"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AuthPage = () => {
  return (
    <main className='flex w-full h-screen bg-background'>
      <div className='w-full md:w-1/2 mx-auto flex items-center justify-center'>
        <Card className="w-full max-w-md h-auto">
          <CardHeader>
            <CardTitle>Auth Form</CardTitle>
            <CardDescription>
              Please SignUp or SignIn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TabSwitcher SignUpTabContent={<SignUpForm />} SignInTabContent={<SignInForm />} />
            <GoogleOAuthButton />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default AuthPage

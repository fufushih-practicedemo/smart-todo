'use client';

import { z } from "zod"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signIn } from '@/actions/auth';
import GoogleOAuthButton from './GoogleOAuthButton';
import { signInSchema } from '@/lib/definitions';


const SignInForm = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    },
  })

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const res = await signIn(values);
    if (res.success) {
      toast.success('Account signin successfully')
      router.push('/')
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Form {...form}>
      <form className='flex flex-col justify-between h-full' onSubmit={form.handleSubmit(onSubmit)}>
        <section className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='Enter your email...'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder="Enter your password..."
                    {...field}
                    onChange={(e) => {
                      e.target.value = e.target.value.trim();
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
        <div className='flex flex-col gap-2 w-full'>
          <Button type='submit'>
            Login
          </Button>
          <GoogleOAuthButton />
        </div>
      </form>
    </Form>
  )
}

export default SignInForm

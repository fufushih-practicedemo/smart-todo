'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from "zod"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signIn } from '@/actions/auth';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

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
        <Button type='submit' className='self-start'>
          Login
        </Button>
      </form>
    </Form>
  )
}

export default SignInForm

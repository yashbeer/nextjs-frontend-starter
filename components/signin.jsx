'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { useAuth } from '@/hooks/use-auth';

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { handlePostAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        toast.error("Login Failed", {
          description: errorData.message || 'Login failed. Please try again.',
          duration: 5000
        });
        return;
      }
  
      const loginData = await loginResponse.json();
      await handlePostAuth(loginData);
    } 
    catch (error) {
      if (error instanceof TypeError) {
        toast.error("Network Error", {
          description: "Please check your internet connection.",
          duration: 5000
        });
      } else {
        toast.error("Login Failed", {
          description: "An error occurred during login. Please try again.",
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="flex justify-center">
          <Image src="https://i.imgur.com/1Q7IHBr.png" alt="Company Logo" width={100} height={100} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email-address">Email address</Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
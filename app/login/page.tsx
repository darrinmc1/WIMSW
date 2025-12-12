"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { ArrowLeft, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/market-research'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error(result.error)
                setIsLoading(false)
                return
            }

            toast.success('Login successful!')
            router.push(callbackUrl)
            router.refresh()
        } catch (error) {
            console.error('Login error:', error)
            toast.error('An unexpected error occurred')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 shadow-xl border-indigo-100 bg-white/80 backdrop-blur-sm">
                <div className="mb-6">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                        <LogIn size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-600 mt-2">
                        Sign in to continue your research
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative text-gray-900">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10 bg-white !text-gray-900"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-700">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative text-gray-900">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 bg-white !text-gray-900"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account? <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
                </p>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}

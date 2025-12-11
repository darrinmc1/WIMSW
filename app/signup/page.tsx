"use client"

import { useSearchParams } from 'next/navigation'
import { BrandName } from '@/components/brand-name'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { ArrowLeft, Mail, Lock } from 'lucide-react'

function SignupContent() {
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan')
    const emailParam = searchParams.get('email')

    const [email, setEmail] = useState(emailParam || '')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/signup-interest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    source: 'signup-page',
                    plan: plan || 'trial'
                }),
            })

            const data = await response.json()

            if (data.success) {
                // Redirect to success page or show success message
                // For now, let's redirect to the market research tool as a "trial"
                window.location.href = '/market-research'
            } else {
                alert('Signup failed. Please try again.')
            }
        } catch (error) {
            console.error('Signup error:', error)
            alert('An error occurred. Please try again.')
        } finally {
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
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-gray-600 mt-2">
                        {plan ? `Sign up for the ${plan} plan` : <BrandName />}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account? <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
                </p>
            </Card>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SignupContent />
        </Suspense>
    )
}

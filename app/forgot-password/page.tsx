"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Mail, Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Failed to process request')
                setIsLoading(false)
                return
            }

            // Success
            setIsSubmitted(true)
            toast.success('Reset PIN sent to your email')

            // Redirect to reset page after short delay? 
            // Better to let them read the success message and click manually or auto-redirect
            // For now, show the success state on this page

        } catch (error) {
            console.error('Error:', error)
            toast.error('An unexpected error occurred')
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 shadow-xl border-indigo-100 bg-white/80 backdrop-blur-sm text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <Mail className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                        <p className="text-gray-600">
                            We've sent a 4-digit PIN to <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg"
                            onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
                        >
                            Enter Reset PIN
                        </Button>

                        <Button variant="ghost" className="w-full" onClick={() => setIsSubmitted(false)}>
                            Try a different email
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 shadow-xl border-indigo-100 bg-white/80 backdrop-blur-sm">
                <div className="mb-6">
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                        <KeyRound size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                    <p className="text-gray-600 mt-2">
                        Enter your email to receive a reset PIN
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Reset PIN'
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

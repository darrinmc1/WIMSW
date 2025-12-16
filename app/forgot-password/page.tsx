
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { BrandName } from "@/components/brand-name"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setIsSubmitted(true)
            toast.success('Reset link sent!')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="mb-8">
                    <BrandName />
                </div>
                <Card className="max-w-md w-full p-8 text-center shadow-lg border-indigo-100">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-8">
                        We've sent a temporary 4-digit PIN to <strong>{email}</strong>.
                        Please use it to log in.
                    </p>
                    <Link href="/login">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-11">
                            Back to Login
                        </Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                <BrandName />
            </div>

            <Card className="max-w-md w-full p-8 shadow-lg border-indigo-100 bg-white">
                <div className="mb-6">
                    <Link href="/login" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Reset PIN</h1>
                    <p className="text-gray-600 mt-2 text-sm">
                        Enter your email address and we'll send you a temporary login PIN.
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
                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isLoading}
                    >
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

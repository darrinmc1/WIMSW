"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, Lock, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PasswordStrengthMeter } from '@/components/password-strength-meter'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Auto-fill email if passed from previous step
    const initialEmail = searchParams.get('email') || ''

    const [step, setStep] = useState<'verify' | 'reset'>('verify')
    const [email, setEmail] = useState(initialEmail)
    const [pin, setPin] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Verify verification
            // For this simple PIN flow, we verify by just checking the PIN on the server
            // But we can also do it in two steps if we want to show a "verified" state
            // For efficiency, we'll verify AND reset in one go on the server if possible, 
            // OR verify first. Let's verify first to be safe.

            const response = await fetch('/api/auth/verify-reset-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pin }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Invalid PIN')
                setIsLoading(false)
                return
            }

            // Success
            toast.success('PIN Verified')
            setStep('reset')
            setIsLoading(false)

        } catch (error) {
            console.error('Error:', error)
            toast.error('An unexpected error occurred')
            setIsLoading(false)
        }
    }

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pin, newPassword }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Failed to reset password')
                setIsLoading(false)
                return
            }

            toast.success('Password reset successfully')
            router.push('/login')

        } catch (error) {
            console.error('Error:', error)
            toast.error('An unexpected error occurred')
            setIsLoading(false)
        }
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
                    <h1 className="text-2xl font-bold text-gray-900">
                        {step === 'verify' ? 'Verify Identity' : 'Set New Password'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {step === 'verify'
                            ? 'Enter the 4-digit PIN sent to your email'
                            : 'Choose a strong password for your account'}
                    </p>
                </div>

                {step === 'verify' ? (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">4-Digit PIN</label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                required
                                className="bg-white text-center text-2xl tracking-widest"
                                placeholder="••••"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Verify PIN'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative text-gray-900">
                                <Lock className="absolute left-3 top-3 text-gray-400 z-10" size={18} />
                                <PasswordInput
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="pl-10 bg-white"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                            <PasswordStrengthMeter password={newPassword} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="relative text-gray-900">
                                <Lock className="absolute left-3 top-3 text-gray-400 z-10" size={18} />
                                <PasswordInput
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="pl-10 bg-white"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                        </Button>
                    </form>
                )}
            </Card>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}

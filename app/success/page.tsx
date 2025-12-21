"use client"

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, ArrowRight, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
    const searchParams = useSearchParams()
    const credits = searchParams.get('credits') || '0'

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center shadow-xl border-indigo-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Successful!</h1>
                <p className="text-gray-600 mb-8">Your credits have been added to your account</p>

                <div className="bg-indigo-50 rounded-xl p-6 mb-8 border border-indigo-100">
                    <div className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-1">Current Balance</div>
                    <div className="text-4xl font-bold text-indigo-800">{credits} Credits</div>
                </div>

                <div className="space-y-3">
                    <Link href="/analyze" className="block">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-12">
                            Start Analyzing Items
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>

                    <Link href="/dashboard" className="block">
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-12">
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            View Dashboard
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-gray-400 mt-6">
                    A receipt has been sent to your email
                </p>
            </Card>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}

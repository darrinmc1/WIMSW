"use client"

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense, useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, ShieldCheck, Loader2 } from 'lucide-react'

function CheckoutContent() {
    const searchParams = useSearchParams()
    const packSize = searchParams.get('pack')
    const price = searchParams.get('price')

    const [processing, setProcessing] = useState(false)

    const handlePayment = () => {
        setProcessing(true)
        // Simulate payment processing
        setTimeout(() => {
            window.location.href = `/success?credits=${packSize || 100}`
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-0 shadow-xl overflow-hidden">
                <div className="bg-gray-900 text-white p-6">
                    <Link href="/pricing" className="text-gray-300 hover:text-white flex items-center gap-1 text-sm mb-4 transition-colors">
                        <ArrowLeft size={16} /> Cancel
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard size={24} /> Secure Checkout
                    </h1>
                </div>

                <div className="p-8 bg-white">
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Summary</h2>
                        <div className="flex justify-between items-center text-gray-700">
                            <span>{packSize || '100'} Credits Pack</span>
                            <span className="font-bold text-lg">${price || '34.99'}</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-gray-300 rounded overflow-hidden relative">
                                    <div className="absolute top-0 right-2 w-2 h-full bg-gray-400/50"></div>
                                </div>
                                <div>
                                    <div className="font-medium text-sm">Test Card</div>
                                    <div className="text-xs text-muted-foreground">**** **** **** 4242</div>
                                </div>
                            </div>
                        </div>
                        {/* Payment form would go here */}
                    </div>

                    <Button
                        onClick={handlePayment}
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-bold shadow-md transition-all hover:scale-[1.02]"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Pay $${price || '34.99'}`
                        )}
                    </Button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheck size={14} />
                        <span>Payments processed securely by Stripe (Mock)</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    )
}

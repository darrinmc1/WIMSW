"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

// Analytics helper
const trackEvent = (eventName: string, properties: any = {}) => {
  // Vercel Analytics
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', eventName, properties)
  }
  
  // Google Analytics (if configured)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      ...properties,
      event_category: 'conversion',
      timestamp: new Date().toISOString()
    })
  }
  
  console.log('📊 Analytics:', eventName, properties)
}

export function TrialBanner() {
    return (
        <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-500 rounded-xl py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                {/* Launch Special Badge */}
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    🚀 LAUNCH SPECIAL
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full md:w-auto">
                    <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 shrink-0">
                        <Sparkles size={32} />
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">Start with 5 Free Analyses</h3>
                        <p className="text-gray-600 font-medium">No Credit Card • Then Just $9/mo • Lock In Low Pricing</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="z-10 w-full md:w-auto text-center">
                    <Link href="/signup?plan=trial">
                        <Button
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-6 px-8 rounded-xl w-full md:w-auto shadow-lg hover:scale-105 transition-all group"
                            onClick={() => {
                                trackEvent('trial_banner_clicked', { 
                                    source: 'pricing_page',
                                    plan: 'trial',
                                    offer: 'launch_special'
                                })
                            }}
                        >
                            Start Free Trial
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Shield, Zap, RefreshCw, Lock, DollarSign, Users, Award, ShoppingCart, Loader2 } from "lucide-react"
import { TrialBanner } from "@/components/trial-banner"
import { MobileStickyAction } from "@/components/mobile-sticky-action"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Lazy load modal - only loads when user clicks "Contact Sales"
const ContactSalesModal = dynamic(() => import("@/components/contact-sales-modal").then(mod => ({ default: mod.ContactSalesModal })), {
  loading: () => null,
  ssr: false
})

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
      event_category: 'pricing',
      timestamp: new Date().toISOString()
    })
  }
  
  console.log('📊 Analytics:', eventName, properties)
}

export function Pricing() {
  const [purchasingPack, setPurchasingPack] = useState<number | null>(null)
  const [selectingTier, setSelectingTier] = useState<string | null>(null)

  const handleTierSelection = (tier: string) => {
    setSelectingTier(tier)

    // Track analytics
    trackEvent('tier_selected', {
      tier: tier,
      source: 'pricing_page',
    })

    // Check if user is logged in (Mock)
    const isLoggedIn = false // checkAuthStatus(); 

    if (!isLoggedIn) {
      // Show loading toast
      toast.loading('Redirecting to signup...')
      
      // Redirect to signup with plan parameter
      setTimeout(() => {
        window.location.href = `/signup?plan=${tier}`
      }, 500)
    } else {
      // Show upgrade modal or go to billing
      toast.success('Opening upgrade options...')
      // console.log(`Showing upgrade modal for: ${tier}`)
    }
  }

  const handleBuyPack = async (packSize: number, price: number) => {
    setPurchasingPack(packSize)

    // Track analytics
    trackEvent('credit_purchase_started', {
      pack_size: packSize,
      amount: price,
      source: 'pricing_page',
    })

    // Check authentication (Mock)
    const user = { id: "mock_user_id" } // checkAuthStatus();

    if (!user) {
      // Save intended purchase and redirect to signup
      sessionStorage.setItem('pendingPurchase', JSON.stringify({ packSize, price }))
      
      toast.loading('Redirecting to signup...')
      
      setTimeout(() => {
        window.location.href = '/signup?returnTo=checkout'
      }, 500)
      return
    }

    // Create checkout session
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packSize: packSize,
          amount: price,
          userId: user.id,
          successUrl: `${window.location.origin}/success?credits=${packSize}`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout')
      }

      const { checkoutUrl } = await response.json()

      if (checkoutUrl) {
        toast.loading('Redirecting to checkout...')
        setTimeout(() => {
          window.location.href = checkoutUrl
        }, 500)
      } else {
        // Fallback for demo
        toast.success('Processing purchase...')
        setTimeout(() => {
          window.location.href = `/success?credits=${packSize}`
        }, 1000)
      }
    } catch (error) {
      console.error('Buy pack error:', error)
      toast.error('Error starting checkout. Please try again.')
      
      trackEvent('credit_purchase_error', {
        pack_size: packSize,
        error: 'checkout_failed'
      })
    } finally {
      setPurchasingPack(null)
    }
  }

  const tiers = [
    {
      id: "starter",
      name: "Starter",
      price: "$9",
      regularPrice: "$18",
      period: "/month",
      description: "Perfect for beginners",
      features: [
        "30 items per month (~1/day)",
        "Gemini 3 Pro AI Analysis",
        "All platform listings",
        "Email support",
        "Google Sheets export",
        "Bulk upload (5 items)",
      ],
      popular: true,
      badge: "🔥 BEST VALUE",
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      regularPrice: "$39",
      period: "/month",
      description: "For active resellers",
      features: [
        "100 items per month (~3/day)",
        "Gemini 3 Pro AI Analysis",
        "Priority processing",
        "Analytics dashboard",
        "Bulk upload (10 items)",
        "API access (limited)",
        "Priority email support",
      ],
      popular: false,
      badge: "⭐ MOST POPULAR",
    },
    {
      id: "business",
      name: "Business",
      price: "$49",
      regularPrice: "$99",
      period: "/month",
      description: "Professional sellers",
      features: [
        "300 items per month (~10/day)",
        "Gemini 3 Pro AI Analysis",
        "Highest priority processing",
        "Full API access",
        "Advanced analytics",
        "Bulk upload (50 items)",
        "24/7 priority support",
        "3 team seats",
        "White-label options",
      ],
      popular: false,
      badge: null,
    },
  ]

  const comparisonFeatures = [
    { name: "Items per month", trial: "5 (Total)", starter: "30", pro: "100", business: "300" },
    { name: "AI Model", trial: "Gemini 3 Pro", starter: "Gemini 3 Pro", pro: "Gemini 3 Pro", business: "Gemini 3 Pro" },
    { name: "Processing Speed", trial: "Standard", starter: "Standard", pro: "Priority", business: "Highest Priority" },
    { name: "Support Level", trial: "None", starter: "Email", pro: "Priority Email", business: "24/7 Priority" },
    { name: "Bulk Upload", trial: "-", starter: "5 items", pro: "10 items", business: "50 items" },
    { name: "Analytics", trial: "-", starter: "Basic", pro: "Dashboard", business: "Advanced" },
    { name: "API Access", trial: "-", starter: "-", pro: "Limited", business: "Full Access" },
    { name: "Team Seats", trial: "-", starter: "-", pro: "-", business: "3 Seats" },
    { name: "White-label", trial: "-", starter: "-", pro: "-", business: "Included" },
  ]

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full mb-4 shadow-lg animate-pulse">
            🚀 LAUNCH SPECIAL - 50% OFF ALL PLANS
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Smart AI Pricing for <span className="text-gradient">Resellers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Start with <span className="text-secondary font-semibold">5 free analyses</span>. Then just <span className="text-primary font-bold">$9/month</span>!
          </p>
          <p className="text-sm text-muted-foreground">
            Lock in these prices before they increase 🔒
          </p>
        </div>

        {/* Trial Banner */}
        <TrialBanner />

        {/* Subscription Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative p-8 border-2 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${tier.popular
                ? "bg-card/50 backdrop-blur-sm border-primary shadow-xl scale-105 z-10 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000"
                : "bg-card/30 backdrop-blur-sm border-border hover:border-border/80"
                }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg whitespace-nowrap">
                  {tier.badge}
                </div>
              )}

              {/* Launch Special Badge */}
              <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                50% OFF
              </div>

              <div className="space-y-6 flex-1 mt-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="line-through text-muted-foreground">{tier.regularPrice}/mo</span>
                    <span className="text-green-600 font-semibold">Save 50%</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="text-secondary shrink-0 mt-0.5" size={18} />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {tier.id === "business" ? (
                  <ContactSalesModal />
                ) : (
                  <Button
                    onClick={() => handleTierSelection(tier.id)}
                    disabled={selectingTier === tier.id}
                    className={`w-full font-bold h-12 text-lg ${tier.popular
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white glow-effect"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    size="lg"
                  >
                    {selectingTier === tier.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Start Free Trial"
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mb-20 overflow-x-auto">
          <h3 className="text-2xl font-bold mb-8 text-center">Compare Plans</h3>
          <div className="min-w-[800px] border border-border/50 rounded-xl overflow-hidden bg-card/20 backdrop-blur-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Features</th>
                  <th className="px-6 py-4 text-center">Trial</th>
                  <th className="px-6 py-4 text-center">Starter</th>
                  <th className="px-6 py-4 text-center text-primary">Pro</th>
                  <th className="px-6 py-4 text-center">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium">{row.name}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{row.trial}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{row.starter}</td>
                    <td className="px-6 py-4 text-center font-medium text-foreground bg-primary/5">{row.pro}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Elements */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center border-t border-border pt-12 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock size={20} className="text-primary" />
            </div>
            <div className="font-semibold text-sm">No hidden fees</div>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw size={20} className="text-primary" />
            </div>
            <div className="font-semibold text-sm">Cancel anytime</div>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign size={20} className="text-primary" />
            </div>
            <div className="font-semibold text-sm">30-day guarantee</div>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield size={20} className="text-primary" />
            </div>
            <div className="font-semibold text-sm">Secure payment</div>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Award size={20} className="text-primary" />
            </div>
            <div className="font-semibold text-sm">90%+ margins</div>
          </div>
        </div>
        <MobileStickyAction
          text="Start 5 FREE Analyses"
          onClick={() => {
            trackEvent('mobile_sticky_clicked', { source: 'pricing_page' })
            window.location.href = "/signup?plan=trial"
          }}
        />
      </div>
    </section>
  )
}

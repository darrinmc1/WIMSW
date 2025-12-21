"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Shield, Zap, RefreshCw, Lock, DollarSign, Users, Award, ShoppingCart, Loader2 } from "lucide-react"
import { TrialBanner } from "@/components/trial-banner"
import { MobileStickyAction } from "@/components/mobile-sticky-action"
import dynamic from "next/dynamic"

// Lazy load modal - only loads when user clicks "Contact Sales"
const ContactSalesModal = dynamic(() => import("@/components/contact-sales-modal").then(mod => ({ default: mod.ContactSalesModal })), {
  loading: () => null,
  ssr: false
})

export function Pricing() {
  const [purchasingPack, setPurchasingPack] = useState<number | null>(null)

  const handleTierSelection = (tier: string) => {
    // Check if user is logged in (Mock)
    const isLoggedIn = false // checkAuthStatus(); 

    if (!isLoggedIn) {
      // Redirect to signup with plan parameter
      // console.log(`Redirecting to signup with plan: ${tier}`)
      window.location.href = `/signup?plan=${tier}`
    } else {
      // Show upgrade modal or go to billing
      // console.log(`Showing upgrade modal for: ${tier}`)
    }

    // Track analytics (Mock)
    if ((window as any).analytics) {
      (window as any).analytics.track('Tier Selected', {
        tier: tier,
        source: 'pricing_page',
        timestamp: new Date()
      })
    }
  }

  const handleBuyPack = async (packSize: number, price: number) => {
    setPurchasingPack(packSize)

    // Check authentication (Mock)
    const user = { id: "mock_user_id" } // checkAuthStatus();

    if (!user) {
      // Save intended purchase and redirect to signup
      sessionStorage.setItem('pendingPurchase', JSON.stringify({ packSize, price }))
      window.location.href = '/signup?returnTo=checkout'
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

      const { checkoutUrl } = await response.json()

      // Redirect to checkout (Mock)
      // For demo purposes, we'll just go straight to success page if no checkoutUrl is provided by our mock API
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        // Fallback for demo
        window.location.href = `/success?credits=${packSize}`
      }

      // Track analytics
      if ((window as any).analytics) {
        (window as any).analytics.track('Credit Purchase Started', {
          packSize: packSize,
          amount: price
        })
      }
    } catch (error) {
      alert('Error starting checkout. Please try again.')
    } finally {
      setPurchasingPack(null)
    }
  }

  const tiers = [
    {
      id: "starter",
      name: "Starter",
      price: "$19.99",
      period: "/month",
      description: "Casual sellers & closet cleanouts",
      features: [
        "50 items per month (~2/day)",
        "Gemini 3 Pro AI Analysis",
        "All platform listings",
        "Email support",
        "Google Sheets export",
        "Bulk upload (5 items)",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$39.99",
      period: "/month",
      description: "Active resellers & side hustlers",
      features: [
        "150 items per month (~5/day)",
        "Gemini 3 Pro AI Analysis",
        "Priority processing",
        "Analytics dashboard",
        "Bulk upload (10 items)",
        "API access (limited)",
        "Priority email support",
      ],
      popular: true,
    },
    {
      id: "business",
      name: "Business",
      price: "$99.99",
      period: "/month",
      description: "Professional resellers & small stores",
      features: [
        "400 items per month (~13/day)",
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
    },
  ]

  const credits = [
    { amount: 25, price: 9.99, unit: "$0.40/item", save: null, description: "Great for testing" },
    { amount: 100, price: 34.99, unit: "$0.35/item", save: "Save 12%", description: "Most popular" },
    { amount: 250, price: 74.99, unit: "$0.30/item", save: "Best Value - Save 25%", description: "Perfect for seasonal sellers" },
  ]

  const comparisonFeatures = [
    { name: "Items per month", trial: "10 (Total)", starter: "50", pro: "150", business: "400" },
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
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Smart AI Pricing for <span className="text-gradient">Resellers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Start with <span className="text-secondary font-semibold">10 free analyses</span>. No credit card required.
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
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
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
                    className={`w-full font-bold h-12 text-lg ${tier.popular
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white glow-effect"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    size="lg"
                  >
                    Start Free Trial
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Pay-As-You-Go Credits</h3>
            <p className="text-muted-foreground">Great for testing or seasonal sellers. Credits never expire.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {credits.map((pack, i) => (
              <Card key={i} className="p-6 bg-card/30 backdrop-blur-sm border-border flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
                {pack.save && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${pack.amount === 250 ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                      {pack.save}
                    </span>
                  </div>
                )}

                <div className="mt-4 text-4xl font-bold mb-1">${pack.price}</div>
                <div className="text-xl font-medium text-foreground mb-1">{pack.amount} Credits</div>
                <div className="text-sm text-gray-500 mb-4">{pack.unit}</div>

                <Button
                  onClick={() => handleBuyPack(pack.amount, pack.price)}
                  disabled={purchasingPack === pack.amount}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 pt-3 h-auto rounded-lg shadow hover:scale-105 transition-all"
                >
                  {purchasingPack === pack.amount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Buy Pack
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
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
          text="Start 10-Day Free Trial"
          onClick={() => window.location.href = "/signup?plan=pro"}
        />
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function FinalCTA() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/signup-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "pricing_cta" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("🎉 Check your email! We sent you a link to get started", {
          duration: 5000,
        })
        setEmail("")

        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'signup_interest', {
            event_category: 'engagement',
            event_label: 'pricing_cta',
            value: email
          })
        }
      } else {
        toast.error(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="get-started" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-700 border-t border-white/10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />

      {/* Launch Special Badge */}
      <div className="absolute top-8 right-8 bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-pulse hidden md:block">
        🚀 LAUNCH SPECIAL - 50% OFF
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-balance tracking-tight">
          Start for FREE!
        </h2>

        <p className="text-xl text-indigo-100 max-w-2xl mx-auto text-pretty">
          Get <span className="text-white font-bold">5 free AI analyses</span>, then continue for just <span className="text-white font-bold">$9/month</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto pt-4 relative">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="bg-white text-gray-900 placeholder:text-gray-400 border-white/20 h-auto py-4 px-6 text-lg rounded-lg focus:ring-indigo-300 focus:border-indigo-300"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-50 h-auto py-4 px-8 text-lg font-bold rounded-lg border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            {loading ? "Sending..." : "Get Started"}
            {!loading && <ArrowRight className="ml-2" size={20} />}
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-indigo-200/80">
          <span>✓ No credit card required to test</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ 5 free analyses</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ Then just $9/month</span>
        </div>
      </div>
    </section>
  )
}

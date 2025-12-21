"use client"


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, AlertCircle } from "lucide-react"

export function FinalCTA() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/signup-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "pricing_cta" }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "🎉 Check your email! We sent you a link to get started" })
        setEmail("")

        // Clear success message after 5 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" })
        }, 5000)
      } else {
        setMessage({ type: "error", text: "Something went wrong. Please try again." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="get-started" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-700 border-t border-white/10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-balance tracking-tight">Ready to Start Selling Smarter?</h2>

        <p className="text-xl text-indigo-100 max-w-2xl mx-auto text-pretty">
          Join thousands of resellers using AI to price their items perfectly
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

        {message.text && (
          <div className={`max-w-md mx-auto p-4 rounded-lg flex items-center justify-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
            {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <p className="text-sm text-indigo-200/80">
          No credit card required • 10 free analyses • Cancel anytime
        </p>
      </div>
    </section>
  )
}

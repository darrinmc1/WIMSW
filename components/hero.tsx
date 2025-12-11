import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] opacity-30 animate-pulse" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] opacity-20" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-primary-foreground text-sm font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Sparkles size={16} className="text-secondary" />
              <span className="text-white font-semibold">
                New: AI-Powered Price Discovery
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-balance">
              Turn Your Closet Into <span className="text-gradient">Cash with AI</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Stop guessing. Our AI analyzes your photos, researches market prices, and creates optimized
              listings for specific platforms in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#try-it-out">
                <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90 glow-effect border-0">
                  Start Selling Smarter
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/10 hover:bg-white/5 hover:text-foreground">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Stats block removed as requested */}
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative glass-panel rounded-2xl p-2 animate-[float_6s_ease-in-out_infinite]">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="/person-taking-photo-of-clothing-with-phone-for-res.jpg"
                  alt="AI Resale App Demo"
                  width={600}
                  height={600}
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Floating UI Elements Overlays */}
                <div className="absolute top-6 right-6 glass-panel p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 text-xs font-bold">$45</span>
                  </div>
                  <div className="text-xs font-medium text-white/80">
                    <div>Est. Profit</div>
                    <div className="text-green-400 font-bold">+15% vs Avg</div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 glass-panel p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs font-medium text-white/90">Analyzing Fabric...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

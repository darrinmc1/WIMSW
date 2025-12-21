import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { Navigation } from "@/components/navigation"
import { MidSectionCTA } from "@/components/mid-section-cta"
import { Footer } from "@/components/footer"
import dynamic from "next/dynamic"

// Lazy load below-the-fold components for better initial page load
const KeyFeatures = dynamic(() => import("@/components/key-features").then(mod => ({ default: mod.KeyFeatures })), {
  loading: () => <div className="py-12 text-center"><div className="animate-pulse h-64 bg-gray-100 rounded"></div></div>,
  ssr: true
})

const PlatformIntegrations = dynamic(() => import("@/components/platform-integrations").then(mod => ({ default: mod.PlatformIntegrations })), {
  loading: () => <div className="py-12 text-center"><div className="animate-pulse h-48 bg-gray-100 rounded"></div></div>,
  ssr: true
})

const Pricing = dynamic(() => import("@/components/pricing").then(mod => ({ default: mod.Pricing })), {
  loading: () => <div className="py-12 text-center"><div className="animate-pulse h-96 bg-gray-100 rounded"></div></div>,
  ssr: true
})

const FAQ = dynamic(() => import("@/components/faq").then(mod => ({ default: mod.FAQ })), {
  loading: () => <div className="py-12 text-center"><div className="animate-pulse h-64 bg-gray-100 rounded"></div></div>,
  ssr: true
})

const FinalCTA = dynamic(() => import("@/components/final-cta").then(mod => ({ default: mod.FinalCTA })), {
  loading: () => <div className="py-12 text-center"><div className="animate-pulse h-32 bg-gray-100 rounded"></div></div>,
  ssr: true
})

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <MidSectionCTA />
        <KeyFeatures />
        <PlatformIntegrations />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

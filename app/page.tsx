import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { InteractiveDemo } from "@/components/interactive-demo"
import { KeyFeatures } from "@/components/key-features"
import { PlatformIntegrations } from "@/components/platform-integrations"
import { Pricing } from "@/components/pricing"

import { FAQ } from "@/components/faq"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

import { MidSectionCTA } from "@/components/mid-section-cta"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <MidSectionCTA />
        <InteractiveDemo />
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

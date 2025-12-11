import { MarketResearch } from "@/components/market-research"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function MarketResearchPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main className="pt-16">
                <MarketResearch />
            </main>
            <Footer />
        </div>
    )
}

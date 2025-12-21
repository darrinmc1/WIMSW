"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Static import to debug/fix build issue
import { MarketResearch } from "@/components/market-research"

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

import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Market Research Tool - WIMSW",
    description: "Analyze photos, identify items, and get real-time market value estimates with AI.",
}

export default function MarketResearchLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}

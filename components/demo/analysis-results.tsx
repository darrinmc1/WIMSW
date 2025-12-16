
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Copy, TrendingUp, DollarSign, Settings, Info, ExternalLink } from "lucide-react"
import { AnalysisData } from "./types"

interface AnalysisResultsProps {
    isAnalyzed: boolean
    analysis: AnalysisData
}

export function AnalysisResults({ isAnalyzed, analysis }: AnalysisResultsProps) {
    const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
    const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)

    const handleCopy = (platform: string) => {
        setCopiedPlatform(platform)
        setTimeout(() => setCopiedPlatform(null), 2000)
    }

    const toggleExpand = (platformName: string) => {
        setExpandedPlatform(expandedPlatform === platformName ? null : platformName)
    }

    if (!isAnalyzed) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 bg-card/50 border-border/50 border-dashed">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <TrendingUp className="text-muted-foreground w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Waiting for Item...</h3>
                <p className="text-muted-foreground max-w-sm">
                    <span className="hidden md:inline">Upload photos on the left</span>
                    <span className="md:hidden">Upload photos above</span> to unlock AI-powered market analysis, simple cross-posting, and profit predictions.
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="text-sm text-muted-foreground mb-1">Estimated Value</div>
                    <div className="text-2xl font-bold text-foreground">{analysis.suggestedPrice}</div>
                </Card>
                <Card className="p-4 bg-card border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                    <div className="text-sm text-muted-foreground mb-1">Best Platform</div>
                    <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                        {analysis.recommendation.platform}
                        <TrendingUp size={20} />
                    </div>
                </Card>
            </div>

            {/* Market Analysis Table */}
            <Card className="overflow-hidden border-border bg-card">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                        <DollarSign size={18} className="text-primary" />
                        Market Comparison
                    </h3>
                </div>
                <div className="divide-y divide-border">
                    <div className="grid grid-cols-4 p-3 text-xs font-medium text-muted-foreground bg-muted/20">
                        <div>Platform</div>
                        <div>Est. Net Profit</div>
                        <div>Speed</div>
                        <div>Draft</div>
                    </div>
                    {analysis.platforms.map((p) => (
                        <div key={p.name} className={`grid grid-cols-4 p-4 items-center gap-2 transition-colors hover:bg-muted/10 ${p.name === analysis.recommendation.platform ? "bg-green-500/5" : ""}`}>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground">{p.name}</span>
                                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                            <div>
                                <div className="font-bold text-foreground">{p.net}</div>
                                <div className="text-xs text-muted-foreground">List: {p.price}</div>
                            </div>
                            <div className="text-xs">
                                <span className={`px-2 py-1 rounded-full ${p.demand === "Very High" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                                    {p.speed}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(p.name)} className="h-8 w-8">
                                {copiedPlatform === p.name ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Listings & Instructions */}
            <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground">Generated Listings & Settings</h4>
                {analysis.platforms.map((platform) => (
                    <Card key={platform.name} className={`overflow-hidden transition-all duration-300 ${expandedPlatform === platform.name ? "ring-2 ring-primary/50" : "hover:border-primary/50"}`}>
                        <div
                            className="p-4 bg-card/40 border-b border-border/50 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleExpand(platform.name)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground">{platform.name}</span>
                                <a
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink size={14} />
                                </a>
                                {platform.name === analysis.recommendation.platform && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500 text-white">RECOMMENDED</span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {expandedPlatform === platform.name ? "Hide Details" : "Show Settings"}
                                <Settings size={14} />
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        <div className={`transition-all duration-300 ease-in-out ${expandedPlatform === platform.name ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                            <div className="p-4 bg-muted/10 space-y-4">
                                <div>
                                    <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-in-expand">Title & Description</div>
                                    <p className="text-sm text-foreground bg-card p-2 rounded border border-border">{platform.listing}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                            <Settings size={12} /> Optimization Settings
                                        </div>
                                        <ul className="text-xs space-y-1.5 list-disc pl-4 text-foreground/90">
                                            {platform.settings.map((setting, i) => (
                                                <li key={i}>{setting}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                            <Info size={12} /> Listing Instructions
                                        </div>
                                        <p className="text-xs text-foreground/80 leading-relaxed">
                                            {platform.instructions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

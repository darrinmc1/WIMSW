
"use client"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    Filter,
    ExternalLink,
    AlertCircle,
    Loader2,
    ShoppingBag,
    TrendingUp
} from "lucide-react"
import { ResearchData, AnalyzedItem } from "./types"

interface MarketResultsProps {
    searchResults: ResearchData | null;
    selectedPlatform: string;
    setSelectedPlatform: (val: string) => void;
    itemDetails: AnalyzedItem | null;
    saving: boolean;
    onSave: () => void;
}

export function MarketResults({
    searchResults,
    selectedPlatform,
    setSelectedPlatform,
    itemDetails,
    saving,
    onSave
}: MarketResultsProps) {
    const resultsRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to results when they appear
    useEffect(() => {
        if (searchResults && resultsRef.current) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }, [searchResults])

    if (!searchResults) return null;

    const filteredItems = (searchResults.similar_items.filter(
        (item) => selectedPlatform === "all" || item.platform.toLowerCase() === selectedPlatform.toLowerCase()
    ) || []).filter((item, index, self) =>
        // Deduplicate based on title and price
        index === self.findIndex((t) => (
            t.title === item.title && t.price === item.price
        ))
    )

    const getPlatformColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case "ebay": return "bg-yellow-500 hover:bg-yellow-600"
            case "poshmark": return "bg-red-500 hover:bg-red-600"
            case "depop": return "bg-purple-500 hover:bg-purple-600"
            case "mercari": return "bg-orange-500 hover:bg-orange-600"
            case "facebook": return "bg-blue-600 hover:bg-blue-700"
            default: return "bg-gray-500 hover:bg-gray-600"
        }
    }

    const getPlatformLink = (platform: string, term: string, itemTitle: string) => {
        const query = encodeURIComponent(term || itemTitle);
        const p = platform.toLowerCase();

        if (p.includes('ebay')) return `https://www.ebay.com/sch/i.html?_nkw=${query}&_sacat=0&LH_Sold=1&LH_Complete=1`;
        if (p.includes('poshmark')) return `https://poshmark.com/search?query=${query}`;
        if (p.includes('mercari')) return `https://www.mercari.com/search/?keyword=${query}&status=sold_out`;
        if (p.includes('depop')) return `https://www.depop.com/search/?q=${query}`;
        if (p.includes('facebook') || p.includes('fb')) return `https://www.facebook.com/marketplace/search/?query=${query}`;
        if (p.includes('offerup')) return `https://offerup.com/search?q=${query}`;
        if (p.includes('craigslist')) return `https://www.craigslist.org/search/sss?query=${query}`;
        if (p.includes('gumtree')) return `https://www.gumtree.com/search?search_category=all&q=${query}`;

        return `https://www.google.com/search?q=${query}+site:${platform}.com`;
    };

    return (
        <>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end -mt-4 mb-2 gap-3">
                <Button
                    onClick={() => {
                        if (!itemDetails) return
                        const params = new URLSearchParams({
                            name: itemDetails.name,
                            brand: itemDetails.brand,
                            category: itemDetails.category,
                            condition: itemDetails.condition
                        })
                        window.location.href = `/create-listing?${params.toString()}`
                    }}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Create Listing
                </Button>

                <Button
                    onClick={onSave}
                    disabled={saving}
                    variant="outline"
                    className="w-full sm:w-auto bg-white border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Save to History
                        </>
                    )}
                </Button>
            </div>

            <div ref={resultsRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6 border-0 shadow-md bg-white">
                        <div className="text-sm font-medium text-indigo-600 mb-1">Items Found</div>
                        <div className="text-3xl font-bold text-gray-900">{searchResults.statistics.total_found}</div>
                    </Card>
                    <Card className="p-6 border-0 shadow-md bg-white">
                        <div className="text-sm font-medium text-green-600 mb-1">Average Price</div>
                        <div className="text-3xl font-bold text-gray-900">${searchResults.statistics.average_price.toFixed(2)}</div>
                    </Card>
                    <Card className="p-6 border-0 shadow-md bg-white">
                        <div className="text-sm font-medium text-blue-600 mb-1">Price Range</div>
                        <div className="text-3xl font-bold text-gray-900">
                            ${searchResults.statistics.lowest_price.toFixed(0)} - ${searchResults.statistics.highest_price.toFixed(0)}
                        </div>
                    </Card>
                    <Card className="p-6 border-0 shadow-md bg-white">
                        <div className="text-sm font-medium text-purple-600 mb-1">Your Position</div>
                        <div className="text-2xl font-bold text-gray-900 truncate">
                            {searchResults.statistics.your_price_position}
                        </div>
                    </Card>
                </div>

                {/* Platform Filter Bar */}
                <Card className="p-4 border-0 shadow-md bg-white rounded-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 font-semibold text-gray-700 min-w-[150px]">
                            <Filter className="h-5 w-5" />
                            Filter by Platform
                        </div>
                        <div className="flex flex-wrap gap-2 w-full">
                            <button
                                onClick={() => setSelectedPlatform("all")}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedPlatform === "all"
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                All Platforms ({searchResults.similar_items.length})
                            </button>
                            {["eBay", "Poshmark", "Depop", "Mercari", "Facebook"].map(platform => {
                                const count = searchResults.similar_items.filter(i => i.platform.toLowerCase() === platform.toLowerCase()).length
                                const isActive = selectedPlatform.toLowerCase() === platform.toLowerCase()
                                if (count === 0 && !isActive) return null

                                let activeClass = ""
                                if (isActive) {
                                    activeClass = getPlatformColor(platform) + " text-white"
                                } else {
                                    activeClass = "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }

                                return (
                                    <button
                                        key={platform}
                                        onClick={() => setSelectedPlatform(platform.toLowerCase())}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeClass}`}
                                    >
                                        {platform} ({count})
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </Card>

                {/* Similar Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item, index) => {
                            return (
                                <Card key={index} className="p-4 border-gray-100 hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-none">
                                                {item.platform_name.toUpperCase()}
                                            </Badge>
                                            {item.status === 'sold' && (
                                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-bold">
                                                    SOLD
                                                </Badge>
                                            )}
                                        </div>
                                        <a
                                            href={getPlatformLink(item.platform_name, (item as any).search_term || item.title, item.title)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-indigo-600 p-2 -mr-2 hover:bg-gray-50 rounded-full transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight h-10 mb-1" title={item.title}>
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{item.size}</span>
                                                <span>•</span>
                                                <span>{item.condition}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div className="text-2xl font-bold text-green-600">
                                                ${item.price.toFixed(2)}
                                            </div>
                                            {item.status === 'sold' && item.sold_date && (
                                                <div className="text-xs text-gray-400">Sold {item.sold_date}</div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium text-gray-500">
                                                <span>Match Confidence</span>
                                                <span>{item.similarity_score}%</span>
                                            </div>
                                            <Progress value={item.similarity_score} className="h-1.5" />
                                        </div>

                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full gap-2 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                        >
                                            <a href={getPlatformLink(item.platform_name, (item as any).search_term || item.title, item.title)} target="_blank" rel="noopener noreferrer">
                                                Find Similar on {item.platform_name}
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No items found for this filter</h3>
                        <p className="text-gray-500">Try selecting "All Platforms" to see more results.</p>
                    </div>
                )}

                {/* Market Insights Panel */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 sm:p-8 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Market Insights</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                            <div className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Pricing Recommendation</div>
                            <div className="text-lg font-semibold leading-relaxed">
                                {searchResults.insights.pricing_recommendation}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
                                <div className="text-indigo-200 text-xs font-bold uppercase mb-2">Market Trend</div>
                                <div className="font-bold text-white">{searchResults.insights.market_trend}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
                                <div className="text-indigo-200 text-xs font-bold uppercase mb-2">Best Platform</div>
                                <div className="font-bold text-white text-sm">{searchResults.insights.best_platform}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
                                <div className="text-indigo-200 text-xs font-bold uppercase mb-2">Competition</div>
                                <div className="font-bold text-white">{searchResults.insights.competition_level}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    TrendingUp,
    Search,
    Filter,
    ExternalLink,
    AlertCircle,
    DollarSign,
    Tag,
    Loader2,
    Camera,
    Upload,
    X
} from "lucide-react"

// Types based on the API response structure provided
interface SimilarItem {
    platform: string
    platform_name: string
    title: string
    price: number
    condition: string
    size: string
    similarity_score: number
    status: "sold" | "active"
    sold_date?: string
    url: string
}

interface Statistics {
    total_found: number
    average_price: number
    lowest_price: number
    highest_price: number
    your_price_position: string
}

interface Insights {
    pricing_recommendation: string
    market_trend: string
    best_platform: string
    competition_level: string
}

interface ResearchData {
    similar_items: SimilarItem[]
    statistics: Statistics
    insights: Insights
}

interface AnalyzedItem {
    name: string
    brand: string
    category: string
    size: string
    condition: string
    estimated_price: number
}

export function MarketResearch() {
    const [loading, setLoading] = useState(false)
    const [analyzingImage, setAnalyzingImage] = useState(false)
    const [searchResults, setSearchResults] = useState<ResearchData | null>(null)
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
    const [error, setError] = useState<string | null>(null)
    const [description, setDescription] = useState("")
    const [imagePreview, setImagePreview] = useState<{
        front: string | null;
        back: string | null;
        label: string | null;
        damage: string | null;
    } | null>({ front: null, back: null, label: null, damage: null })

    const [itemDetails, setItemDetails] = useState<AnalyzedItem | null>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

    // const fileInputRef = useRef<HTMLInputElement>(null) // No longer needed with individual inputs

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'front' | 'back' | 'label' | 'damage') => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setImagePreview(prev => ({ ...prev!, [slot]: base64String }))

                // Only analyze if it's the front image (primary)
                if (slot === 'front') {
                    analyzeImage(base64String)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const analyzeImage = async (base64Image: string) => {
        setAnalyzingImage(true)
        setError(null)
        try {
            const response = await fetch("/api/analyze-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to analyze image")

            if (data.success) {
                setItemDetails(data.data)
            }
        } catch (err: any) {
            console.error("Analysis Error:", err)
            setError(err.message || "Failed to identify item from image.")
        } finally {
            setAnalyzingImage(false)
        }
    }

    const handleResearch = async () => {
        if (!itemDetails) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/market-research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...itemDetails,
                    description // Pass the user description
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to fetch market data")

            if (data.success) {
                setSearchResults(data.data)
                // Auto-scroll to results
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 100)
            }
        } catch (err: any) {
            console.error("Research Error:", err)
            setError(err.message || "Failed to research similar items.")
        } finally {
            setLoading(false)
        }
    }

    const clearAll = () => {
        setImagePreview({ front: null, back: null, label: null, damage: null })
        setItemDetails(null)
        setSearchResults(null)
        setError(null)
        setDescription("")
    }

    const filteredItems = searchResults?.similar_items.filter(
        (item) => selectedPlatform === "all" || item.platform.toLowerCase() === selectedPlatform.toLowerCase()
    ) || []

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

    const getPlatformBadgeColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case "ebay": return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "poshmark": return "bg-red-100 text-red-800 border-red-200"
            case "depop": return "bg-purple-100 text-purple-800 border-purple-200"
            case "mercari": return "bg-orange-100 text-orange-800 border-orange-200"
            case "facebook": return "bg-blue-100 text-blue-800 border-blue-200"
            default: return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Search className="text-indigo-600 h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Market Research</h1>
                        </div>
                        <p className="text-lg text-gray-600 ml-16">Upload an item photo to instantly find market value</p>
                    </div>
                </div>

                {/* Main Input/Analysis Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left: Image Upload */}
                    {/* Left: Image Uploads & Description */}
                    <div className="md:col-span-1 space-y-6">
                        {/* 4-Grid Image Upload */}
                        <div className="grid grid-cols-2 gap-4">
                            {['Front View', 'Back View', 'Brand Label', 'Damage/Wear'].map((label, index) => {
                                const slotName = ['front', 'back', 'label', 'damage'][index] as 'front' | 'back' | 'label' | 'damage';
                                const currentImage = imagePreview?.[slotName];

                                return (
                                    <div
                                        key={slotName}
                                        onClick={() => {
                                            // Trigger hidden input for this specific slot
                                            document.getElementById(`file-input-${slotName}`)?.click();
                                        }}
                                        className="aspect-square bg-white rounded-xl shadow-sm border-2 border-dashed border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col items-center justify-center relative group overflow-hidden"
                                    >
                                        {currentImage ? (
                                            <>
                                                <img src={currentImage} alt={label} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImagePreview(prev => prev ? ({ ...prev, [slotName]: null }) : null);
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 bg-indigo-50 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                                    <Camera className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 text-center px-1">{label}</span>
                                            </>
                                        )}
                                        <input
                                            id={`file-input-${slotName}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, slotName)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        {/* Description Field */}
                        <Card className="p-4 border-0 shadow-lg bg-white">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Item Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add any extra details... (e.g. 'Small tear on sleeve', 'Vintage 1990s')"
                                className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
                            />
                        </Card>
                    </div>

                    {/* Right: Item Details & Actions */}
                    <Card className="p-6 md:col-span-2 rounded-xl shadow-lg border-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center">
                        {!itemDetails ? (
                            <div className="text-center text-gray-400 py-10">
                                <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Upload an image to automatically detail your item</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{itemDetails.name}</h2>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge variant="secondary">{itemDetails.brand}</Badge>
                                            <Badge variant="outline">{itemDetails.category}</Badge>
                                            <Badge variant="outline">{itemDetails.condition}</Badge>
                                            {itemDetails.size !== "N/A" && <Badge variant="outline">{itemDetails.size}</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Est. Value</div>
                                        <div className="text-2xl font-bold text-green-600">${itemDetails.estimated_price}</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={handleResearch}
                                        disabled={loading}
                                        className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-md"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Scanning Marketplaces...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-5 w-5" />
                                                Run Market Research
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {searchResults && (
                        <div className="flex flex-col sm:flex-row sm:justify-end -mt-4 mb-2">
                            <Button
                                onClick={async () => {
                                    if (!searchResults || !itemDetails) return
                                    try {
                                        const response = await fetch('/api/save-research', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                itemName: itemDetails.name,
                                                brand: itemDetails.brand,
                                                category: itemDetails.category,
                                                estimatedPrice: itemDetails.estimated_price,
                                                averagePrice: searchResults.statistics.average_price,
                                                lowestPrice: searchResults.statistics.lowest_price,
                                                highestPrice: searchResults.statistics.highest_price,
                                                date: new Date().toISOString()
                                            })
                                        })
                                        if (response.ok) {
                                            alert("Saved to History!")
                                        }
                                    } catch (e) {
                                        console.error(e)
                                        alert("Failed to save")
                                    }
                                }}
                                variant="outline"
                                className="w-full sm:w-auto bg-white border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                            >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Save to History
                            </Button>
                        </div>
                    )}

                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in" role="alert">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                )}

                {searchResults && (
                    <div ref={resultsRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Statistics Dashboard */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPlatform === "all"
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
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeClass}`}
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
                                    const priceDiff = item.price - (itemDetails?.estimated_price || 0)

                                    return (
                                        <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
                                            <div className="p-5 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getPlatformBadgeColor(item.platform)}`}>
                                                        {item.platform_name}
                                                    </span>
                                                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${item.status === 'sold' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {item.status === 'sold' ? <CheckCircleIcon /> : <ClockIcon />}
                                                        {item.status === 'sold' ? 'Sold' : 'Active'}
                                                    </span>
                                                </div>

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
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                        View on {item.platform_name}
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
                )}
            </div>
        </div>
    )
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    )
}


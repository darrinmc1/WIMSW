"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
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
    X,
    ShoppingBag,
    Sparkles
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
    const [isLocalOnly, setIsLocalOnly] = useState(false)
    const [sizeInput, setSizeInput] = useState("")
    const [ageInput, setAgeInput] = useState("")
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

    // Use a map of refs for file inputs to avoid ID conflicts
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'front' | 'back' | 'label' | 'damage') => {
        console.log(`[Market Research] handleImageUpload called for slot: ${slot}`)
        const file = e.target.files?.[0]

        if (!file) {
            console.log('[Market Research] No file selected')
            return
        }

        console.log('[Market Research] File selected:', { name: file.name, size: file.size, type: file.type })

        // File Validation
        if (!file.type.startsWith('image/')) {
            console.error('[Market Research] Invalid file type:', file.type)
            toast.error("Please upload a valid image file (JPG, PNG)")
            e.target.value = ''
            return
        }

        // Processing Toast
        const toastId = toast.loading("Optimizing image for upload...")

        const reader = new FileReader()

        reader.onerror = () => {
            console.error('[Market Research] FileReader error')
            toast.dismiss(toastId)
            toast.error('Failed to read image file. Please try again.')
            e.target.value = ''
        }

        reader.onloadend = async () => {
            console.log('[Market Research] FileReader finished, result type:', typeof reader.result)
            if (typeof reader.result === 'string') {
                try {
                    console.log('[Market Research] Starting image resize...')
                    // Resize image to max 1024x1024 and 0.8 quality
                    const resizedImage = await resizeImage(reader.result, 1024, 0.8)
                    console.log('[Market Research] Image resized successfully')

                    setImagePreview(prev => (prev ? { ...prev, [slot]: resizedImage } : null))
                    toast.dismiss(toastId)
                    toast.success('Image uploaded!')

                    // Only analyze if it's the front image (primary)
                    if (slot === 'front') {
                        console.log('[Market Research] Front image resized & uploaded, auto-analyzing...')
                        analyzeImage(resizedImage)
                    } else {
                        console.log(`[Market Research] ${slot} image uploaded (not front, skipping auto-analyze)`)
                    }
                } catch (err) {
                    console.error("[Market Research] Image resizing failed:", err)
                    toast.dismiss(toastId)
                    toast.error("Failed to process image. Please try another one.")
                }
            } else {
                console.error('[Market Research] FileReader result is not a string')
                toast.dismiss(toastId)
                toast.error("Failed to read image. Please try again.")
            }
        }

        console.log('[Market Research] Starting FileReader.readAsDataURL...')
        reader.readAsDataURL(file)

        // Reset input so same file can be selected again
        e.target.value = ''
    }

    // Utility to resize image
    const resizeImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = base64Str
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width
                        width = maxWidth
                    }
                } else {
                    if (height > maxWidth) {
                        width *= maxWidth / height
                        height = maxWidth
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject('Canvas context not available')
                    return
                }
                ctx.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL('image/jpeg', quality))
            }
            img.onerror = (err) => reject(err)
        })
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

            if (!response.ok) {
                // Log admin debug info from response headers
                const errorId = response.headers.get('X-Error-ID');
                const errorDebug = response.headers.get('X-Error-Debug');
                const errorTimestamp = response.headers.get('X-Error-Timestamp');

                console.error("=== API ERROR (Admin Debug Info) ===");
                console.error("Error ID:", errorId);
                console.error("Error Debug:", errorDebug);
                console.error("Timestamp:", errorTimestamp);
                console.error("Status:", response.status);
                console.error("====================================");

                if (response.status === 429) {
                    const text = await response.text();
                    try {
                        const data = JSON.parse(text);
                        // Check if user hit free limit and needs to sign up
                        if (data.requiresAuth) {
                            throw new Error(data.error || "Free limit reached")
                        }
                        throw new Error(data.error || "We're experiencing high traffic. Please try again in a minute.")
                    } catch (e) {
                        throw new Error("We're experiencing high traffic. Please try again in a minute.")
                    }
                }
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    throw new Error(data.error || `Server error: ${response.status} - ${text.substring(0, 100)}`);
                } catch (e) {
                    // If NOT valid JSON, throw the raw text or generic error
                    throw new Error(`Server Error (${response.status}): ${text || "Unknown error occurred"}`);
                }
            }

            const data = await response.json()

            if (data.success) {
                setItemDetails(data.data)
                toast.success("Item identified successfully!")
            }
        } catch (err: any) {
            console.error("Analysis Error:", err)
            const errorMsg = err.message || "Failed to identify item from image."
            setError(errorMsg)

            // Show special toast with sign-up action if free limit reached
            if (errorMsg.includes("Free limit reached") || errorMsg.includes("free daily limit")) {
                toast.error(errorMsg, {
                    duration: 6000,
                    action: {
                        label: "Sign Up",
                        onClick: () => window.location.href = "/login"
                    }
                })
            } else {
                toast.error(errorMsg)
            }
        } finally {
            setAnalyzingImage(false)
        }
    }

    const handleResearch = async () => {
        console.log('[Market Research] handleResearch called', { itemDetails })
        if (!itemDetails) {
            console.log('[Market Research] No item details, aborting')
            toast.error("Please upload and analyze an item first")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/market-research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...itemDetails,
                    description,
                    sizeInput,
                    ageInput,
                    isLocalOnly
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to fetch market data")

            if (data.success) {
                setSearchResults(data.data)
                toast.success("Market research completed!")
                // Auto-scroll to results
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 100)
            }
        } catch (err: any) {
            console.error("Research Error:", err)
            const errorMsg = err.message || "Failed to research similar items."
            setError(errorMsg)
            toast.error(errorMsg)
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

    const filteredItems = (searchResults?.similar_items.filter(
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

    const renderUploadCard = (label: string, slot: 'front' | 'back' | 'label' | 'damage') => {
        const preview = imagePreview?.[slot]

        return (
            <Card
                key={slot}
                className={`relative aspect-square border-2 border-dashed rounded-xl overflow-hidden ${preview ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
            >
                <label htmlFor={`market-upload-${slot}`} className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50 group">
                    <input
                        id={`market-upload-${slot}`}
                        type="file"
                        ref={(el) => { if (fileInputRefs.current) fileInputRefs.current[slot] = el }}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageUpload(e, slot)}
                    />

                    {preview ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <img src={preview} alt={label} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="text-white h-8 w-8" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <Camera className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-700 text-center px-2">{label}</span>
                        </>
                    )}
                </label>
            </Card>
        )
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
                    <div className={!itemDetails && !analyzingImage ? "md:col-span-3 max-w-4xl mx-auto w-full space-y-8 transition-all duration-500 ease-in-out" : "md:col-span-1 space-y-6 transition-all duration-500 ease-in-out"}>
                        {/* 4-Grid Image Upload */}
                        <div className="grid grid-cols-2 gap-4">
                            {renderUploadCard('Front View', 'front')}
                            {renderUploadCard('Back View', 'back')}
                            {renderUploadCard('Brand Label', 'label')}
                            {renderUploadCard('Damage/Wear', 'damage')}
                        </div>

                        {/* Manual Analyze Button (Fallback if auto-trigger fails) */}
                        {imagePreview?.front && !itemDetails && !analyzingImage && (
                            <Button
                                onClick={() => analyzeImage(imagePreview.front!)}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md animate-in fade-in"
                            >
                                <Sparkles className="mr-2 h-5 w-5" />
                                Analyze Item Details
                            </Button>
                        )}

                        {/* Description & Details Fields */}
                        <Card className="p-4 border-0 shadow-lg bg-white space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Size (Optional)</label>
                                    <input
                                        type="text"
                                        value={sizeInput}
                                        onChange={(e) => setSizeInput(e.target.value)}
                                        placeholder="e.g. Medium, 10, 32x32"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Approx Age (Optional)</label>
                                    <input
                                        type="text"
                                        value={ageInput}
                                        onChange={(e) => setAgeInput(e.target.value)}
                                        placeholder="e.g. 2020, 90s Vintage"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Extra Details (Defects, etc.)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add any extra details... (e.g. '100% Silk', 'Model #123', 'Missing button', 'Original box included')"
                                    className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right: Item Details & Actions */}
                    {(itemDetails || analyzingImage) && (
                        <Card className="p-6 md:col-span-2 rounded-xl shadow-lg border-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-700">
                            {analyzingImage ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                                        <div className="relative p-4 bg-indigo-50 rounded-full">
                                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-xl font-semibold text-gray-900">Analyzing your item...</p>
                                        <p className="text-sm text-gray-500">Our AI is identifying the brand, condition, and details</p>
                                    </div>
                                </div>
                            ) : itemDetails && (
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

                                    <div className="pt-4 border-t border-gray-100 space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="localOnly"
                                                checked={isLocalOnly}
                                                onChange={(e) => setIsLocalOnly(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                            />
                                            <label htmlFor="localOnly" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                                Search Local Only (Large items, furniture, etc.)
                                            </label>
                                        </div>
                                        <Button
                                            onClick={handleResearch}
                                            disabled={loading || !itemDetails}
                                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                    )}

                    {searchResults && (
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
                                            toast.success("Saved to History!")
                                        }
                                    } catch (e) {
                                        console.error(e)
                                        toast.error("Failed to save")
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

                                    // Helper to generate correct search URLs
                                    const getPlatformLink = (platform: string, term: string) => {
                                        const query = encodeURIComponent(term || item.title);
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
                                                    href={getPlatformLink(item.platform_name, (item as any).search_term || item.title)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 hover:text-indigo-600"
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
                                                    <a href={getPlatformLink(item.platform_name, (item as any).search_term || item.title)} target="_blank" rel="noopener noreferrer">
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



"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Search, AlertCircle } from "lucide-react"
import { AnalyzedItem, ResearchData } from "./market-research/types"
import { ImageUploadGrid } from "./market-research/image-upload-grid"
import { ItemDetailsCard } from "./market-research/item-details-card"
import { MarketResults } from "./market-research/market-results"
import { MobileStickyAction } from "@/components/mobile-sticky-action"
import { fetchWithRetry } from "@/lib/utils"

export function MarketResearch() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
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

    const onImageUpload = (slot: 'front' | 'back' | 'label' | 'damage', base64Image: string) => {
        setImagePreview(prev => (prev ? { ...prev, [slot]: base64Image } : null))
    }

    const analyzeImage = async (base64Image: string) => {
        setAnalyzingImage(true)
        setError(null)
        try {
            const response = await fetchWithRetry("/api/analyze-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            })

            if (!response.ok) {
                if (response.status === 429) {
                    const text = await response.text();
                    try {
                        const data = JSON.parse(text);
                        // Check if user hit free limit and needs to sign up
                        if (data.requiresAuth) {
                            const limit = response.headers.get('X-RateLimit-Limit') || "2";
                            // Calculate reset time if needed, or just use the generic message requested
                            throw new Error(`You've used ${limit} of ${limit} free analyses today.\nCreate a free account to get 10 free analyses.\nYour limit resets in 24 hours.`)
                        }
                        throw new Error(data.error || "We're experiencing high traffic.")
                    } catch (e: any) {
                        // Preserve the specific message we just threw
                        if (e.message.includes("You've used")) throw e;
                        throw new Error("We're experiencing high traffic. Please try again.")
                    }
                }
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    throw new Error(data.error || `Server error: ${response.status}`);
                } catch (e) {
                    throw new Error(`Server Error (${response.status}): ${text}`);
                }
            }

            const data = await response.json()

            if (data.success) {
                setItemDetails(data.data)
                // Set description from AI or fallback to constructed string
                const aiDesc = data.data.description ||
                    `${data.data.condition} ${data.data.brand || 'Unbranded'} ${data.data.name}. Category: ${data.data.category}.`;
                setDescription(aiDesc);
                toast.success("Item identified successfully!")
            }
        } catch (err: any) {
            console.error("Analysis Error:", err)
            const errorMsg = err.message || "Failed to identify item from image."
            setError(errorMsg)

            // Show special toast with sign-up action if free limit reached
            if (errorMsg.includes("Free limit reached") || errorMsg.includes("free daily limit") || errorMsg.includes("You've used")) {
                toast.error(errorMsg, {
                    duration: 8000, // Longer duration for the longer message
                    action: {
                        label: "Sign Up",
                        onClick: () => window.location.href = "/signup" // Corrected link to signup
                    },
                    style: { whiteSpace: 'pre-line' } // Allow newlines
                })
            } else {
                toast.error("Analysis Failed", {
                    description: errorMsg + " Please check your connection and try again."
                })
            }
        } finally {
            setAnalyzingImage(false)
        }
    }

    const handleResearch = async () => {
        console.log('[Market Research] handleResearch called', { itemDetails })
        if (!itemDetails) {
            toast.error("Please upload and analyze an item first")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetchWithRetry("/api/market-research", {
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
            }
        } catch (err: any) {
            console.error("Research Error:", err)
            const errorMsg = err.message || "Failed to research similar items."
            setError(errorMsg)
            toast.error("Research Failed", {
                description: errorMsg + " We could not complete the market scan. Please retry."
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!searchResults || !itemDetails) return
        setSaving(true)
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
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 font-sans">
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

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 md:gap-4 bg-white/50 p-2 rounded-lg backdrop-blur-sm">
                        {/* Step 1: Upload */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!itemDetails ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${!itemDetails ? 'bg-white text-indigo-600' : 'bg-gray-200'}`}>1</div>
                            <span className="hidden sm:inline">Upload</span>
                        </div>
                        <div className="w-4 h-0.5 bg-gray-300 rounded-full" />

                        {/* Step 2: Details */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${itemDetails && !searchResults ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${itemDetails && !searchResults ? 'bg-white text-indigo-600' : 'bg-gray-200'}`}>2</div>
                            <span className="hidden sm:inline">Details</span>
                        </div>
                        <div className="w-4 h-0.5 bg-gray-300 rounded-full" />

                        {/* Step 3: Results */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${searchResults ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${searchResults ? 'bg-white text-indigo-600' : 'bg-gray-200'}`}>3</div>
                            <span className="hidden sm:inline">Results</span>
                        </div>
                    </div>
                </div>

                {/* Main Input/Analysis Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left: Image Upload & Details */}
                    <ImageUploadGrid
                        imagePreview={imagePreview}
                        onImageUpload={onImageUpload}
                        onAnalyze={analyzeImage}
                        itemDetails={itemDetails}
                        analyzingImage={analyzingImage}
                        description={description}
                        setDescription={setDescription}
                        sizeInput={sizeInput}
                        setSizeInput={setSizeInput}
                        ageInput={ageInput}
                        setAgeInput={setAgeInput}
                    />

                    {/* Right: Item Details & Actions */}
                    <ItemDetailsCard
                        itemDetails={itemDetails}
                        analyzingImage={analyzingImage}
                        loading={loading}
                        isLocalOnly={isLocalOnly}
                        setIsLocalOnly={setIsLocalOnly}
                        onResearch={handleResearch}
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in" role="alert">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Results Section */}
                <MarketResults
                    searchResults={searchResults}
                    selectedPlatform={selectedPlatform}
                    setSelectedPlatform={setSelectedPlatform}
                    itemDetails={itemDetails}
                    saving={saving}
                    onSave={handleSave}
                />

                {/* Mobile Sticky Actions */}
                {!itemDetails && imagePreview?.front && !analyzingImage && (
                    <MobileStickyAction
                        text="✨ Identify Item"
                        onClick={() => analyzeImage(imagePreview.front!)}
                    />
                )}

                {analyzingImage && (
                    <MobileStickyAction
                        text="Identifying..."
                        onClick={() => { }}
                        loading={true}
                    />
                )}

                {itemDetails && !searchResults && !loading && (
                    <MobileStickyAction
                        onClick={handleResearch}
                        text="🚀 Analyze Market Value"
                    />
                )}

                {loading && (
                    <MobileStickyAction
                        text="Searching Market..."
                        onClick={() => { }}
                        loading={true}
                    />
                )}

                {searchResults && !saving && (
                    <MobileStickyAction
                        text="💾 Save Research"
                        onClick={handleSave}
                        variant="outline"
                    />
                )}
            </div>
        </div>
    )
}

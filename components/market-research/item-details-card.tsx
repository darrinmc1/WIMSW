
"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { AnalyzedItem } from "./types"
import { BrandedLoader } from "@/components/branded-loader"

interface ItemDetailsCardProps {
    itemDetails: AnalyzedItem | null;
    analyzingImage: boolean;
    loading: boolean;
    isLocalOnly: boolean;
    setIsLocalOnly: (val: boolean) => void;
    onResearch: () => void;
}

export function ItemDetailsCard({
    itemDetails,
    analyzingImage,
    loading,
    isLocalOnly,
    setIsLocalOnly,
    onResearch
}: ItemDetailsCardProps) {
    if (!itemDetails && !analyzingImage) return null;

    return (
        <Card className="p-6 md:col-span-2 rounded-xl shadow-lg border-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-700">
            {analyzingImage ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <BrandedLoader
                        messages={[
                            "🔍 Identifying item...",
                            "🏷️ Detecting brand...",
                            "📏 Estimating size...",
                            "📊 Analyzing condition..."
                        ]}
                        className="scale-125"
                    />
                </div>
            ) : itemDetails && (
                <div className="space-y-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{itemDetails.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary">{itemDetails.brand}</Badge>
                                <Badge variant="outline">{itemDetails.category}</Badge>
                                <Badge variant="outline">{itemDetails.condition}</Badge>
                                {itemDetails.size !== "N/A" && <Badge variant="outline">{itemDetails.size}</Badge>}
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-sm text-gray-500">Est. Value</div>
                            <div className="text-2xl font-bold text-green-600">${itemDetails.estimated_price}</div>
                        </div>
                    </div>

                    {/* NEW: Item Description */}
                    {itemDetails.description && (
                        <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                            <h3 className="text-sm font-semibold text-indigo-900 mb-1">AI Analysis</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {itemDetails.description}
                            </p>
                        </div>
                    )}

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
                            onClick={onResearch}
                            disabled={loading || !itemDetails}
                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <BrandedLoader
                                    messages={[
                                        "🔍 Scanning Marketplaces...",
                                        "💰 Finding Best Prices...",
                                        "📉 Analyzing Trends...",
                                        "🚚 Checking Shipping..."
                                    ]}
                                    iconClass="h-5 w-5 text-white"
                                    className="text-white"
                                />
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
    )
}

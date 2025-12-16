"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag, DollarSign } from "lucide-react"
import type { AnalyzedItem } from "./types"

interface ItemDetailsFormProps {
    itemDetails: AnalyzedItem | null
    sizeInput: string
    setSizeInput: (value: string) => void
    ageInput: string
    setAgeInput: (value: string) => void
    description: string
    setDescription: (value: string) => void
    analyzingImage: boolean
}

export const ItemDetailsForm = memo(function ItemDetailsForm({
    itemDetails,
    sizeInput,
    setSizeInput,
    ageInput,
    setAgeInput,
    description,
    setDescription,
    analyzingImage
}: ItemDetailsFormProps) {
    if (!itemDetails && !analyzingImage) {
        return (
            <Card className="p-8 border-dashed border-2 text-center">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Upload an image to begin analysis</p>
                <p className="text-sm text-muted-foreground mt-2">Our AI will identify your item automatically</p>
            </Card>
        )
    }

    if (analyzingImage) {
        return (
            <Card className="p-8 border-dashed border-2 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 w-12 mx-auto bg-muted rounded-full" />
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">Analyzing your item...</p>
            </Card>
        )
    }

    return (
        <Card className="p-6 bg-white shadow-sm">
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{itemDetails?.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                            {itemDetails?.brand}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                            {itemDetails?.category}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            {itemDetails?.condition}
                        </Badge>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-900">Estimated Value</span>
                    </div>
                    <p className="text-3xl font-bold text-indigo-600">${itemDetails?.estimated_price}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <Input
                            value={sizeInput || itemDetails?.size || ''}
                            onChange={(e) => setSizeInput(e.target.value)}
                            placeholder="e.g., M, 10, OS"
                            className="border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age/Year</label>
                        <Input
                            value={ageInput}
                            onChange={(e) => setAgeInput(e.target.value)}
                            placeholder="e.g., 2020, Vintage"
                            className="border-gray-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add any specific details about your item..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    />
                </div>
            </div>
        </Card>
    )
})

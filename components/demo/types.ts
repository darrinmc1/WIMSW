
export type PhotoCategory = "front" | "back" | "label" | "damage"

export interface PhotoSlot {
    category: PhotoCategory
    label: string
    description: string
    image: string | null
}

export interface PlatformConfig {
    name: string
    listing: string
    price: string
    fees: string
    net: string
    speed: string
    demand: string
    url: string
    instructions: string
    settings: string[]
}

export interface AnalysisRecommendation {
    platform: string
    reason: string
}

export interface AnalysisData {
    brand: string
    item: string
    condition: string
    suggestedPrice: string
    recommendation: AnalysisRecommendation
    platforms: PlatformConfig[]
}


// Market Research Types
export interface SimilarItem {
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

export interface ImagePreview {
    front: string | null;
    back: string | null;
    label: string | null;
    damage: string | null;
}

export interface Statistics {
    total_found: number
    average_price: number
    lowest_price: number
    highest_price: number
    your_price_position: string
}

export interface Insights {
    pricing_recommendation: string
    market_trend: string
    best_platform: string
    competition_level: string
}

export interface ResearchData {
    similar_items: SimilarItem[]
    statistics: Statistics
    insights: Insights
}

export interface AnalyzedItem {
    name: string
    brand: string
    category: string
    size: string
    condition: string
    estimated_price: number
    description?: string
}

// Interactive Demo Types
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

// API Response Types
export interface AnalyzeItemResponse {
    success: boolean;
    data?: AnalyzedItem;
    error?: string;
    requiresAuth?: boolean;
    errorId?: string;
}

export interface MarketResearchResponse {
    success: boolean;
    data?: ResearchData;
    error?: string;
    errorId?: string;
}

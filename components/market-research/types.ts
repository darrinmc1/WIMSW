
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
}

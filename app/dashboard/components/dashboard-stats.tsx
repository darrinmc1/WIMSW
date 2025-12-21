import { Card } from "@/components/ui/card"
import { Award } from "lucide-react"

interface DashboardStatsProps {
    stats: {
        totalItems: number
        totalValue: number
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 shadow-sm">
                    <div className="text-2xl font-bold text-indigo-400">{stats.totalItems}</div>
                    <div className="text-xs text-gray-500 mt-1">Items Analyzed</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 shadow-sm">
                    <div className="text-2xl font-bold text-purple-400">
                        ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Potential Value</div>
                </div>
            </div>
            {stats.totalItems >= 10 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg flex items-center gap-3 animate-in slide-in-from-bottom-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <div>
                        <div className="font-semibold text-yellow-900 text-sm">Power Seller!</div>
                        <div className="text-xs text-yellow-700">You've analyzed 10+ items</div>
                    </div>
                </div>
            )}
        </Card>
    )
}

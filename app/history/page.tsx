"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ResearchHistoryList, ResearchRecord } from "@/components/research-history-list"

export default function HistoryPage() {
    const router = useRouter()
    const [history, setHistory] = useState<ResearchRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/get-research-history')

            if (response.status === 401) {
                toast.error('Please log in to view your research history')
                router.push('/login?callbackUrl=/history')
                return
            }

            if (!response.ok) {
                throw new Error('Failed to load history')
            }

            const result = await response.json()

            if (result.success) {
                setHistory(result.data || [])
            } else {
                throw new Error(result.error || 'Failed to load history')
            }
        } catch (error: any) {
            console.error("Failed to load history:", error)
            setError(error.message || 'Something went wrong. Please try again.')
            toast.error(error.message || 'Failed to load research history')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/market-research">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white border-0 shadow-sm hover:bg-gray-50">
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Research History</h1>
                            <p className="text-gray-600">Track all your past item analysis and market values</p>
                        </div>
                    </div>
                    <Link href="/market-research">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl">
                            <Search className="mr-2 h-4 w-4" />
                            New Research
                        </Button>
                    </Link>
                </div>

                {/* Content */}
                <ResearchHistoryList
                    history={history}
                    loading={loading}
                    error={error}
                    onRetry={fetchHistory}
                />
            </div>
        </div>
    )
}

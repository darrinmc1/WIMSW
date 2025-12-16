"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Calendar, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export interface ResearchRecord {
    id: number
    date: string
    itemName: string
    brand: string
    category: string
    estimatedPrice: string
    averagePrice: string
    priceRange: string
    status: string
}

interface ResearchHistoryListProps {
    history: ResearchRecord[]
    loading: boolean
    error: string | null
    onRetry: () => void
    limit?: number
}

function TableSkeleton() {
    return (
        <div className="hidden md:block overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Est. Value</TableHead>
                        <TableHead>Market Avg</TableHead>
                        <TableHead>Range</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function MobileCardsSkeleton() {
    return (
        <div className="md:hidden space-y-4 p-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <Skeleton className="h-3 w-16 mb-2" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                        <Skeleton className="h-5 w-12" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                        <div>
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ResearchHistoryList({ history, loading, error, onRetry, limit }: ResearchHistoryListProps) {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    const displayHistory = limit ? history.slice(0, limit) : history;

    return (
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
            {loading ? (
                <>
                    <TableSkeleton />
                    <MobileCardsSkeleton />
                </>
            ) : error ? (
                <div className="text-center py-12 px-4">
                    <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load History</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Button onClick={onRetry} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                </div>
            ) : displayHistory.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Research History</h3>
                    <p className="text-gray-500 mb-6">Start researching items to see your history here</p>
                    <Link href="/market-research">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            Start Your First Analysis
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Desktop/Tablet View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Est. Value</TableHead>
                                    <TableHead>Market Avg</TableHead>
                                    <TableHead>Range</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayHistory.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <TableCell className="font-medium text-gray-600">
                                            {formatDate(record.date)}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 max-w-[300px] truncate" title={record.itemName}>
                                            {record.itemName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white">{record.brand}</Badge>
                                        </TableCell>
                                        <TableCell className="text-green-600 font-bold">
                                            {record.estimatedPrice !== '0' ? `$${Number(record.estimatedPrice).toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-indigo-600 font-bold">
                                            {record.averagePrice !== '0' ? `$${Number(record.averagePrice).toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {record.priceRange}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">
                                                Saved
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-4 p-4">
                        {displayHistory.map((record) => (
                            <div key={record.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">{formatDate(record.date)}</div>
                                        <h3 className="font-bold text-gray-900 line-clamp-2">{record.itemName}</h3>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none text-xs">
                                        Saved
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="text-xs">{record.brand}</Badge>
                                    <Badge variant="outline" className="text-xs">{record.category}</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                                    <div>
                                        <div className="text-xs text-gray-500">Est. Value</div>
                                        <div className="font-bold text-green-600">
                                            {record.estimatedPrice !== '0' ? `$${Number(record.estimatedPrice).toFixed(2)}` : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Market Avg</div>
                                        <div className="font-bold text-indigo-600">
                                            {record.averagePrice !== '0' ? `$${Number(record.averagePrice).toFixed(2)}` : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Card>
    )
}

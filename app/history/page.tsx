
"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Loader2, Calendar, Search } from "lucide-react"
import Link from "next/link"

interface ResearchRecord {
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

export default function HistoryPage() {
    const [history, setHistory] = useState<ResearchRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/get-research-history')
            const result = await response.json()
            if (result.success) {
                setHistory(result.data)
            }
        } catch (error) {
            console.error("Failed to load history:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString()
        } catch (e) {
            return dateString
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
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-20">
                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No Research History</h3>
                            <p className="text-gray-500">Items you verify will appear here.</p>
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
                                        {history.map((record) => (
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
                                {history.map((record) => (
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
            </div>
        </div>
    )
}

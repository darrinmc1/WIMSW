import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Nav Skeleton */}
            <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full max-w-md rounded-xl" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Card Skeleton */}
                        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl h-[200px] flex flex-col justify-between">
                            <Skeleton className="h-7 w-40 mb-4" />
                            <div className="space-y-4">
                                <div>
                                    <Skeleton className="h-4 w-12 mb-2" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-12 mb-2" />
                                    <Skeleton className="h-5 w-48" />
                                </div>
                            </div>
                        </Card>

                        {/* Stats Card Skeleton */}
                        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl h-[200px]">
                            <Skeleton className="h-7 w-32 mb-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-lg border border-white/10 shadow-sm h-24">
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg border border-white/10 shadow-sm h-24">
                                    <Skeleton className="h-8 w-24 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

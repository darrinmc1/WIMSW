"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, History, Key, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BrandName } from "@/components/brand-name"
import { ResearchHistoryList } from "@/components/research-history-list"
import { toast } from "sonner"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

// Imported Components
import { ProfileCard } from "./components/profile-card"
import { DashboardStats } from "./components/dashboard-stats"
import { PasswordChangeForm } from "./components/password-change-form"

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")

    // History & Stats State
    const [history, setHistory] = useState([])
    const [stats, setStats] = useState({ totalItems: 0, totalValue: 0 })
    const [historyLoading, setHistoryLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/dashboard")
        }
    }, [status, router])

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (status !== "authenticated") return;

            setHistoryLoading(true);
            try {
                // Fetch History
                const historyRes = await fetch("/api/get-research-history?limit=20");
                const historyData = await historyRes.json();
                if (historyData.success) {
                    setHistory(historyData.data);
                }

                // Fetch Stats
                const statsRes = await fetch("/api/user/stats");
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats(statsData.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchData();
    }, [status]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    if (status === "loading") {
        return <DashboardSkeleton />
    }

    if (!session) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <BrandName />
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-white hover:bg-white/10">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                    <p className="text-gray-400 mt-1">Manage your account and view your history</p>
                </div>

                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl shadow-sm grid grid-cols-3 w-full max-w-md">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-white hover:bg-white/5 min-h-[44px] py-3 sm:py-2">
                            <User className="h-5 w-5 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-white hover:bg-white/5 min-h-[44px] py-3 sm:py-2">
                            <History className="h-5 w-5 mr-2" />
                            History
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-white hover:bg-white/5 min-h-[44px] py-3 sm:py-2">
                            <Key className="h-5 w-5 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileCard session={session} />
                            <DashboardStats stats={stats} />
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                            <h3 className="text-lg font-semibold text-white mb-4">Research History</h3>
                            <ResearchHistoryList
                                history={history}
                                loading={historyLoading}
                                error={null}
                                onRetry={() => { }}
                            />
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <PasswordChangeForm />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

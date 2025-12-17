"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, History, Key, LogOut, Eye, EyeOff } from "lucide-react"
import { signOut } from "next-auth/react"
import { BrandName } from "@/components/brand-name"
import { ResearchHistoryList } from "@/components/research-history-list"
import { toast } from "sonner"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

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

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "Failed to change password")
            } else {
                toast.success("Password changed successfully")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
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
                        <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-white hover:bg-white/5">
                            <User className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-white hover:bg-white/5">
                            <History className="h-4 w-4 mr-2" />
                            History
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-white hover:bg-white/5">
                            <Key className="h-4 w-4 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                                <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="text-gray-500 mb-1">Name</div>
                                        <div className="font-medium text-gray-200">{session.user?.name || "No name set"}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Email</div>
                                        <div className="font-medium text-gray-200">{session.user?.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Plan Status</div>
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                            Free Plan
                                        </div>
                                    </div>
                                </div>
                            </Card>

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
                            </Card>
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
                        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Current Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 pr-10"
                                        />
                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 pr-10"
                                        />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <PasswordStrengthMeter password={newPassword} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="bg-white/10 border-white/10 text-white placeholder:text-gray-500"
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 w-full mt-4">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                                </Button>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ResearchHistoryList, ResearchRecord } from "@/components/research-history-list"
import { User, Shield, History, WalletCards, Loader2 } from "lucide-react"

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // History State
    const [history, setHistory] = useState<ResearchRecord[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState<string | null>(null)

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordLoading, setPasswordLoading] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/dashboard")
        }
    }, [status, router])

    useEffect(() => {
        if (status === 'authenticated') {
            fetchHistory()
        }
    }, [status])

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true)
            setHistoryError(null)
            const response = await fetch('/api/get-research-history')
            if (!response.ok) throw new Error('Failed to load history')
            const result = await response.json()
            if (result.success) {
                setHistory(result.data || [])
            }
        } catch (error) {
            setHistoryError('Failed to load history')
        } finally {
            setHistoryLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match")
            return
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        try {
            setPasswordLoading(true)
            const response = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to update password")
            }

            toast.success("Password updated successfully")
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    if (!session) return null

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Manage your account and view your activity</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 max-w-md bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 rounded-lg">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 rounded-lg">
                            <History className="w-4 h-4 mr-2" />
                            History
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 rounded-lg">
                            <Shield className="w-4 h-4 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Your personal account details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input value={session.user?.name || ''} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input value={session.user?.email || ''} readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Type</Label>
                                        <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                                            <WalletCards className="w-5 h-5 text-gray-500" />
                                            <span className="capitalize font-medium">{session.user?.plan || 'Free'} Plan</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <div>
                                            <Badge variant={session.user?.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                                                {session.user?.role || 'User'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Search History</h2>
                                <Button variant="outline" size="sm" onClick={fetchHistory}>Refresh</Button>
                            </div>
                            <ResearchHistoryList
                                history={history}
                                loading={historyLoading}
                                error={historyError}
                                onRetry={fetchHistory}
                            />
                        </div>
                    </TabsContent>

                    {/* Security Tab (Password) */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Password Settings</CardTitle>
                                <CardDescription>Update your password to keep your account secure</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Current Password</Label>
                                        <Input
                                            id="current"
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new">New Password</Label>
                                        <Input
                                            id="new"
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirm New Password</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={passwordLoading}>
                                        {passwordLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Password"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

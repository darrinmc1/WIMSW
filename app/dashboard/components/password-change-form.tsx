"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"

export function PasswordChangeForm() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

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

    return (
        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Current Password</label>
                    <div className="relative">
                        <PasswordInput
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="bg-white/10 border-white/10 text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">New Password</label>
                    <div className="relative">
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            className="bg-white/10 border-white/10 text-white placeholder:text-gray-500"
                        />
                    </div>
                    <PasswordStrengthMeter password={newPassword} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
                    <PasswordInput
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
    )
}

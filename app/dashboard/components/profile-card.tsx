import { Card } from "@/components/ui/card"
import { Session } from "next-auth"

interface ProfileCardProps {
    session: Session | null
}

export function ProfileCard({ session }: ProfileCardProps) {
    return (
        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
            <div className="space-y-3 text-sm">
                <div>
                    <div className="text-gray-500 mb-1">Name</div>
                    <div className="font-medium text-gray-200">{session?.user?.name || "No name set"}</div>
                </div>
                <div>
                    <div className="text-gray-500 mb-1">Email</div>
                    <div className="font-medium text-gray-200">{session?.user?.email}</div>
                </div>
                <div>
                    <div className="text-gray-500 mb-1">Plan Status</div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        Free Plan
                    </div>
                </div>
            </div>
        </Card>
    )
}

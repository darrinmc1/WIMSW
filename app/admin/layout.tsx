import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Settings, LogOut, FileText } from "lucide-react"
import { UserRole } from "@prisma/client"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    // Protect Admin Route
    if (!session || session.user.role !== UserRole.ADMIN) {
        redirect("/login?callbackUrl=/admin")
    }

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "System Logs", href: "https://vercel.com", icon: FileText },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ]

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">W</span>
                        </div>
                        <span className="font-bold text-xl">Admin</span>
                    </Link>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition-colors"
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700 absolute bottom-6 w-52">
                        <div className="px-4 py-2">
                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">System</p>
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-1"
                            >
                                <LogOut className="w-4 h-4 rotate-180" />
                                Back to App
                            </Link>
                            <Link
                                href="/api/auth/signout"
                                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-8">
                    <h1 className="text-lg font-semibold">Admin Panel</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Welcome, {session.user?.name}</span>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(session.user?.name?.[0] || 'A').toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

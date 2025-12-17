import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Dashboard - WIMSW",
    description: "View your research history, potential value stats, and manage your account settings.",
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}

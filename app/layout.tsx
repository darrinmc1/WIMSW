import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" })

export const metadata: Metadata = {
  title: "WIMSW.com - What Is My Stuff Worth?",
  description:
    "Instant AI-powered market research and pricing for your secondhand items. Find out what your stuff is worth on eBay, Poshmark, and more.",
  generator: "WIMSW",
  keywords: ["resale", "AI pricing", "clothing resale", "eBay", "Poshmark", "Depop", "secondhand", "value check"],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover' // Critical for safe area insets
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}

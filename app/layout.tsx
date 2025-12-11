import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WIMSW.com - What Is My Stuff Worth?",
  description:
    "Instant AI-powered market research and pricing for your secondhand items. Find out what your stuff is worth on eBay, Poshmark, and more.",
  generator: "WIMSW",
  keywords: ["resale", "AI pricing", "clothing resale", "eBay", "Poshmark", "Depop", "secondhand", "value check"],
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isLoggedIn = pathname?.includes('/history') || pathname?.includes('/market-research') || pathname?.includes('/success')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "History", href: "/history" },
    { label: "FAQ", href: "/#faq" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg" : "bg-transparent backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-foreground">ResaleAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.filter(item => {
              // filter out some items if logged in if desired, but keeping all for now
              return true;
            }).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  Logged In
                </span>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  My Profile
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Log in
                </Link>
                <Link href="/#get-started">
                  <Button>Get Started Free</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="py-2 flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">Logged In</span>
              </div>
            ) : (
              <>
                <Link href="/login" className="block text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Log in
                </Link>
                <Link href="/#get-started" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

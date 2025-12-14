"use client"

import { useState, useEffect } from "react"
import { BrandName } from "@/components/brand-name"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { useSession } from "next-auth/react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const isLoggedIn = !!session

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Market Research", href: "/market-research" },
    { label: "Pricing", href: "/#pricing" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" : "bg-transparent backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <BrandName className="text-xl font-bold text-foreground" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-foreground hover:bg-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link href="/market-research">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu (Sheet) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-white font-bold text-lg">W</span>
                    </div>
                    <span className="font-bold">Menu</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="text-lg font-medium text-foreground/90 hover:text-primary transition-colors px-2 py-1 block"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  <div className="border-t border-border pt-6">
                    {isLoggedIn ? (
                      <div className="space-y-4">
                        <SheetClose asChild>
                          <Link href="/dashboard" className="w-full">
                            <Button className="w-full justify-start gap-2" variant="outline">
                              <User className="h-4 w-4" />
                              My Dashboard
                            </Button>
                          </Link>
                        </SheetClose>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <SheetClose asChild>
                          <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full">Log In</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/market-research" className="w-full">
                            <Button className="w-full">Get Started Free</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

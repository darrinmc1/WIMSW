"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileStickyActionProps {
    text: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
    className?: string
    variant?: "default" | "secondary" | "outline"
}

export function MobileStickyAction({
    text,
    onClick,
    disabled = false,
    loading = false,
    className,
    variant = "default"
}: MobileStickyActionProps) {
    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-40 md:hidden pb-safe",
            className
        )}>
            <Button
                size="lg"
                className="w-full h-12 text-lg font-bold shadow-lg"
                onClick={onClick}
                disabled={disabled || loading}
                variant={variant}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    text
                )}
            </Button>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface BrandedLoaderProps {
    messages: string[]
    interval?: number
    className?: string
    iconClass?: string
}

export function BrandedLoader({
    messages,
    interval = 2500,
    className = "",
    iconClass = "h-5 w-5 text-indigo-600"
}: BrandedLoaderProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length)
        }, interval)

        return () => clearInterval(timer)
    }, [messages.length, interval])

    return (
        <div className={`flex items-center justify-center gap-3 ${className}`}>
            <Loader2 className={`animate-spin ${iconClass}`} />
            <div className="relative h-6 w-64 overflow-hidden flex items-center justify-start"> {/* Fixed width container to prevent layout shifts */}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={messages[index]}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute whitespace-nowrap font-medium text-gray-700"
                    >
                        {messages[index]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    )
}

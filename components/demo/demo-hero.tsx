
import { BrandName } from "@/components/brand-name"

export function DemoHero() {
    return (
        <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Try It Out</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                See how <BrandName /> analyzes your items and finds the estimated profit across all platforms.
            </p>
            <p className="text-base text-white font-medium">
                Get 3 free searches - no account required
            </p>
        </div>
    )
}

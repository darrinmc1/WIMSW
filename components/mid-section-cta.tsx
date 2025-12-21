
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function MidSectionCTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600" />

            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative max-w-4xl mx-auto text-center px-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                    Ready to turn your extra stuff into cash?
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Instantly find out what your items are worth and sell them faster with AI.
                </p>
                <Link href="/market-research">
                    <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 text-lg px-8 h-12 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 font-semibold">
                        Try It Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    )
}

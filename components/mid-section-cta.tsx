
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function MidSectionCTA() {
    return (
        <section className="py-20 bg-indigo-50/50 border-y border-indigo-100">
            <div className="max-w-4xl mx-auto text-center px-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Ready to turn your extra stuff into cash?
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Instantly find out what your items are worth and sell them faster with AI.
                </p>
                <Link href="/signup">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 h-12 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                        Sign Up for Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    )
}

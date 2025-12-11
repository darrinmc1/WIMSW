import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import { BrandName } from "@/components/brand-name"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Part-time Reseller",
      image: "/professional-woman-portrait.png",
      quote: (
        <>
          <BrandName /> helped me turn my closet cleanout into a $5,000 side hustle in just 3 months. The AI pricing is incredibly accurate!
        </>
      ),
      rating: 5,
    },
    {
      name: "Marcus Chen",
      role: "Full-time Reseller",
      image: "/professional-man-portrait.png",
      quote: "I used to spend hours researching prices. Now it takes seconds. I've listed 3x more items and doubled my monthly revenue.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Fashion Enthusiast",
      image: "/casual-woman-portrait.png",
      quote: "The multi-platform feature is a game-changer. I can reach buyers on all my favorite platforms without rewriting everything.",
      rating: 5,
    },
    {
      name: "David Thompson",
      role: "Vintage Collector",
      image: "/casual-man-portrait.png",
      quote: "Finally, an AI tool that understands vintage clothing! The brand recognition is spot-on, even for rare pieces.",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/20 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Loved by Resellers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            See what our community is saying about <BrandName />
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="fill-amber-400 text-amber-400" size={20} />
                ))}
              </div>

              <div className="text-foreground text-lg leading-relaxed mb-6">"{testimonial.quote}"</div>

              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

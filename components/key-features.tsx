import { TrendingUp, Tag, CheckCircle, Share2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function KeyFeatures() {
  const features = [
    {
      icon: TrendingUp,
      title: "AI Price Discovery",
      description: "Get accurate pricing based on real market data from thousands of similar listings",
      color: "indigo",
    },
    {
      icon: Tag,
      title: "Brand Recognition",
      description: "Automatically identifies brands, styles, and key details from your photos",
      color: "coral",
    },
    {
      icon: CheckCircle,
      title: "Condition Assessment",
      description: "AI evaluates condition to help you price fairly and describe accurately",
      color: "emerald",
    },
    {
      icon: Share2,
      title: "Multi-Platform Ready",
      description: "One photo, five optimized listings for different platforms with platform-specific formatting",
      color: "amber",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to sell faster and earn more
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card border-border hover:shadow-lg transition-all duration-300 group">
              <div
                className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-950 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`text-${feature.color}-600 dark:text-${feature.color}-400`} size={28} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Start Using These Features Used
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

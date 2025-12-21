import { TrendingUp, Tag, FileText, Share2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function KeyFeatures() {
  const features = [
    {
      icon: TrendingUp,
      title: "AI Price Discovery",
      description: "Get accurate pricing based on real market data from thousands of similar listings",
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Tag,
      title: "Brand Recognition",
      description: "Automatically identifies brands, styles, and key details from your photos",
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: FileText,
      title: "Compelling Descriptions",
      description: "AI generates professional, persuasive wording to highlight your item's value and help you sell faster",
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Share2,
      title: "Multi-Platform Ready",
      description: "One photo, five optimized listings for different platforms with platform-specific formatting",
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-500/10",
    },
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block pb-1">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to sell faster and earn more
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-card/50 backdrop-blur-sm border-border hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 group hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-indigo-500 transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/signup">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full font-bold shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-105">
              Start Using These Features Used
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

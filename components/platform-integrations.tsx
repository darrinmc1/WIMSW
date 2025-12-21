import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PlatformIntegrations() {
  const platforms = [
    {
      name: "eBay",
      description: "Keyword-optimized titles and detailed descriptions for maximum visibility",
      logo: "/ebay-logo.jpg",
    },
    {
      name: "Poshmark",
      description: "Hashtag-rich descriptions and community-friendly language",
      logo: "/poshmark-logo.jpg",
    },
    {
      name: "Depop",
      description: "Casual, trendy descriptions with emoji and vintage appeal",
      logo: "/depop-logo.jpg",
    },
    {
      name: "Facebook Marketplace",
      description: "Local-focused listings with clear pricing and quick response prompts",
      logo: "/facebook-marketplace-logo.jpg",
    },
    {
      name: "Mercari",
      description: "Mobile-optimized listings with shipping details and brand callouts",
      logo: "/mercari-logo.jpg",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Sell on Top Platforms</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Optimized listings for major resale platforms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <Card
              key={index}
              className="p-6 bg-card border-border hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="h-16 flex items-center mb-4">
                <div className="text-2xl font-bold text-foreground">{platform.name}</div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{platform.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/signup">
            <Button size="lg" className="bg-background text-foreground border-2 border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 px-8 py-6 text-lg rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:scale-105">
              Start Cross-Listing Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

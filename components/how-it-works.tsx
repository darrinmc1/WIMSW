import { Camera, Brain, Network } from "lucide-react"
import { Card } from "@/components/ui/card"

export function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: "Upload Photo",
      description: "Take a photo of your clothing item with your phone",
      number: "01",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description:
        "Our AI identifies the item, brand, condition, and suggests competitive pricing based on real market data",
      number: "02",
    },
    {
      icon: Network,
      title: "Multi-Platform Listing",
      description: "Copy optimized listings for eBay, Poshmark, Depop, Facebook Marketplace, and Mercari in one click",
      number: "03",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Three simple steps to start earning more from your secondhand clothing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative p-8 bg-card border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl">
                {step.number}
              </div>

              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mb-6">
                <step.icon className="text-indigo-600 dark:text-indigo-400" size={32} />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

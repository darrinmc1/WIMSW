import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "How does the trial work?",
      answer: "You get 10 free item analyses immediately upon signing up. No credit card is required, and these credits never expire. You get full access to our Gemini 3 Pro AI model and all platform features during the trial.",
    },
    {
      question: "Can I switch plans?",
      answer: "Yes, you can upgrade, downgrade, or switch between monthly subscriptions and credit packs at any time. If you switch from a subscription to credits, you'll retain access until the end of your billing cycle.",
    },
    {
      question: "Do credits expire?",
      answer: "No! Credits you purchase or receive in credit packs never expire. You can use them at your own pace, whether that takes a week or a year.",
    },
    {
      question: "What happens after the trial?",
      answer: "Once you've used your 10 free credits, you can choose to subscribe to a monthly plan (starting at $14.99/mo) or purchase a credit pack (starting at $9.99). There are no automatic charges.",
    },
    {
      question: "How accurate is the AI pricing?",
      answer: "Our AI analyzes millions of real listings across all major platforms to provide pricing recommendations with 98% accuracy. We use the latest Gemini 3 Pro models to ensure the best possible market data.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. All subscriptions are month-to-month with no contracts. You can cancel with one click from your dashboard. Our 30-day money-back guarantee applies to your first month.",
    },
  ]

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative">
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Frequently Asked <span className="text-gradient">Questions</span></h2>
          <p className="text-xl text-muted-foreground text-pretty">Everything you need to know about ResaleAI</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="glass-panel border border-white/5 rounded-lg px-6 data-[state=open]:border-primary/50 transition-colors">
              <AccordionTrigger className="text-left text-foreground hover:text-primary transition-colors py-6 text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

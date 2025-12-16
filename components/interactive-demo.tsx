
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DemoHero } from "./demo/demo-hero"
import { UploadSection } from "./demo/upload-section"
import { AnalysisResults } from "./demo/analysis-results"
import { PhotoSlot, AnalysisData } from "./demo/types"

export function InteractiveDemo() {
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [userDescription, setUserDescription] = useState("")

  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { category: "front", label: "Front View", description: "Main photo of item", image: null },
    { category: "back", label: "Back View", description: "Rear angle", image: null },
    { category: "label", label: "Brand Label", description: "Tags & authenticity", image: null },
    { category: "damage", label: "Damage/Wear", description: "Flaws if any (optional)", image: null },
  ])

  // Template for structure (empty state)
  const templateAnalysis: AnalysisData = {
    brand: "",
    item: "",
    condition: "",
    suggestedPrice: "",
    recommendation: {
      platform: "",
      reason: ""
    },
    platforms: [
      {
        name: "eBay",
        listing: "[Brand] [Item] - Excellent Condition - Authentic - Fast Ship",
        price: "",
        fees: "",
        net: "",
        speed: "Fast (1-3 days)",
        demand: "High",
        url: "",
        instructions: "List as 'Buy It Now'. Use the 7-day duration if auctioning, but fixed price is recommended for this item.",
        settings: [
          "Category: Clothing, Shoes & Accessories",
          "Condition: Pre-owned",
          "Accept Offers: Yes",
          "Shipping: Buyer pays"
        ]
      },
      {
        name: "Poshmark",
        listing: "[Brand] [Item] 💙 #fashion #style #authentic",
        price: "",
        fees: "",
        net: "",
        speed: "Medium (3-7 days)",
        demand: "Medium",
        url: "",
        instructions: "Share to evening parties for better visibility. Send offers to likers 1 hour after they like.",
        settings: [
          "Category: Clothing",
          "Size: Standard",
          "Original Price: [Price]",
          "Discount Shipping: No"
        ]
      },
      {
        name: "Depop",
        listing: "vintage [brand] [item] 🔥 great condition, ready to ship 📦",
        price: "",
        fees: "",
        net: "",
        speed: "Fast (1-5 days)",
        demand: "Very High",
        url: "",
        instructions: "Refresh listing daily. Use all 5 hashtags. Message buyers who like the item with a 10% discount.",
        settings: [
          "Category: Menswear/Womenswear",
          "Style Tags: Streetwear, Vintage",
          "Shipping: Ship with Depop",
          "International Shipping: No"
        ]
      },
    ],
  }

  const [analysis, setAnalysis] = useState<AnalysisData>(templateAnalysis)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    const frontPhoto = photos.find(p => p.category === "front")?.image
    console.log('[Interactive Demo] handleAnalyze called', { hasFrontPhoto: !!frontPhoto })
    if (!frontPhoto) {
      console.log('[Interactive Demo] No front photo, aborting')
      toast.error("Please upload a front photo first")
      return
    }

    setIsAnalyzing(true)
    console.log('[Interactive Demo] Starting analysis...')
    try {
      // Call the API
      const response = await fetch("/api/analyze-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frontPhoto }),
      })

      // Handle non-200 responses specifically
      if (!response.ok) {
        // Log admin debug info from response headers
        const errorId = response.headers.get('X-Error-ID');
        const errorDebug = response.headers.get('X-Error-Debug');
        const errorTimestamp = response.headers.get('X-Error-Timestamp');

        console.error("=== API ERROR (Admin Debug Info) ===");
        console.error("Error ID:", errorId);
        console.error("Error Debug:", errorDebug);
        console.error("Timestamp:", errorTimestamp);
        console.error("Status:", response.status);
        console.error("====================================");

        if (response.status === 429) {
          const data = await response.json()
          // Check if user hit free limit and needs to sign up
          if (data.requiresAuth) {
            throw new Error(data.error || "Free limit reached")
          }
          throw new Error("System busy")
        }
        const data = await response.json()
        throw new Error(data.error || "Analysis failed")
      }

      const data = await response.json()

      if (data.success && data.data) {
        const { brand, name, estimated_price } = data.data
        const searchTerm = encodeURIComponent(`${brand} ${name}`)

        // Update analysis with real data
        setAnalysis(prev => ({
          ...prev,
          brand: brand,
          item: name,
          suggestedPrice: `$${estimated_price}`,
          platforms: prev.platforms.map(p => {
            // Create real search URL
            let realUrl = ""
            if (p.name === "eBay") realUrl = `https://www.ebay.com/sch/i.html?_nkw=${searchTerm}`
            if (p.name === "Poshmark") realUrl = `https://poshmark.com/search?query=${searchTerm}`
            if (p.name === "Depop") realUrl = `https://www.depop.com/search/?q=${searchTerm}`

            // Update listing title dynamically
            let newListing = p.listing
              .replace(/\[Brand\]/gi, brand)
              .replace(/\[Item\]/gi, name)
              .replace(/\[Price\]/gi, `$${estimated_price}`)

            return {
              ...p,
              url: realUrl,
              listing: newListing,
              price: `$${estimated_price}`,
              net: `$${(estimated_price * 0.85).toFixed(2)}` // Approx net calc
            }
          })
        }))
        setIsAnalyzed(true)
        toast.success("Item analyzed successfully!")
      }
    } catch (error: any) {
      console.error("Demo analysis failed", error)
      if (error.message.includes("Free limit reached") || error.message.includes("free daily limit")) {
        toast.error(error.message, {
          duration: 6000,
          action: {
            label: "Sign Up",
            onClick: () => window.location.href = "/login"
          }
        })
      } else if (error.message.includes("System busy")) {
        toast.error("High demand! Our AI agents are busy. Please wait a moment and try again.")
      } else {
        toast.error("Something went wrong with the analysis. Please try again.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section id="try-it-out" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-card/5 to-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <DemoHero />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <UploadSection
            photos={photos}
            setPhotos={setPhotos}
            userDescription={userDescription}
            setUserDescription={setUserDescription}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            isAnalyzed={isAnalyzed}
          />
          <AnalysisResults
            isAnalyzed={isAnalyzed}
            analysis={analysis}
          />
        </div>
      </div >
    </section >
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { BrandName } from "@/components/brand-name"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Check, Copy, X, Camera, TrendingUp, DollarSign, Settings, Info, ExternalLink } from "lucide-react"

type PhotoCategory = "front" | "back" | "label" | "damage"

interface PhotoSlot {
  category: PhotoCategory
  label: string
  description: string
  image: string | null
}

export function InteractiveDemo() {
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
  const [userDescription, setUserDescription] = useState("")

  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { category: "front", label: "Front View", description: "Main photo of item", image: null },
    { category: "back", label: "Back View", description: "Rear angle", image: null },
    { category: "label", label: "Brand Label", description: "Tags & authenticity", image: null },
    { category: "damage", label: "Damage/Wear", description: "Flaws if any (optional)", image: null },
  ])

  // Template for structure (empty state)
  const templateAnalysis = {
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

  const [analysis, setAnalysis] = useState(templateAnalysis)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const resizeImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height
            height = maxWidth
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject('Canvas context not available')
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject('Failed to load image')
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, category: PhotoCategory) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file (JPG, PNG, WEBP, etc.)');
        e.target.value = ''; // Reset input
        return;
      }

      const toastId = toast.loading("Optimizing image for upload...")

      const reader = new FileReader()
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          try {
            // Resize image to max 1024x1024 and 0.8 quality
            const resizedImage = await resizeImage(reader.result, 1024, 0.8)
            setPhotos((prev) => prev.map((photo) => (photo.category === category ? { ...photo, image: resizedImage } : photo)))
            toast.dismiss(toastId)
            toast.success('Image uploaded successfully!')
          } catch (err) {
            console.error("Image resizing failed:", err)
            toast.dismiss(toastId)
            toast.error("Failed to process image. Please try another one.")
          }
        }
      }
      reader.onerror = () => {
        toast.dismiss(toastId)
        toast.error('Failed to read image file. Please try again.');
      }
      reader.readAsDataURL(file)
      e.target.value = '' // Reset input
    }
  }

  const handleRemovePhoto = (category: PhotoCategory) => {
    setPhotos((prev) => prev.map((photo) => (photo.category === category ? { ...photo, image: null } : photo)))
  }

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
        if (response.status === 429) {
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
        setExpandedPlatform("Depop")
        toast.success("Item analyzed successfully!")
      }
    } catch (error: any) {
      console.error("Demo analysis failed", error)
      if (error.message.includes("System busy")) {
        toast.error("High demand! Our AI agents are busy. Please wait a moment and try again.")
      } else {
        toast.error("Something went wrong with the analysis. Please try again.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCopy = (platform: string) => {
    setCopiedPlatform(platform)
    setTimeout(() => setCopiedPlatform(null), 2000)
  }

  const toggleExpand = (platformName: string) => {
    setExpandedPlatform(expandedPlatform === platformName ? null : platformName)
  }

  const hasMinimumPhotos = photos.find((p) => p.category === "front")?.image !== null

  return (
    <section id="try-it-out" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-card/5 to-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Try It Out</h2>




          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            See how <BrandName /> analyzes your items and finds the estimated profit across all platforms.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Upload */}
          <Card className="p-6 bg-card border-border flex flex-col">
            <h3 className="text-2xl font-semibold text-foreground mb-6">1. Upload Photos</h3>

            <div className="bg-primary/10 rounded-lg p-4 text-sm text-primary border border-primary/20 mb-6">
              <strong className="block mb-1">💡 Pro Tip</strong>
              Clear lighting and brand tags help our AI identify precise models to maximize your profit.
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 flex-1 content-start">
              {photos.map((photo) => (
                <div key={photo.category} className="space-y-2">
                  <div className="text-sm font-medium text-foreground">{photo.label}</div>
                  <div className="relative aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-border hover:border-primary transition-all duration-300 group overflow-hidden">
                    {photo.image ? (
                      <>
                        <img
                          src={photo.image}
                          alt={photo.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <button
                          onClick={() => handleRemovePhoto(photo.category)}
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-white rounded-full p-1.5 shadow-md transition-colors"
                        >
                          <X size={14} className="currentColor" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, photo.category)}
                        />
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="text-primary" size={20} />
                        </div>
                        <span className="text-xs text-muted-foreground text-center px-2">{photo.description}</span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Optional Description</label>
                <Textarea
                  placeholder="Add details like Size, Brand, Condition, or Defects to help AI give a better estimate..."
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  className="bg-card/50 resize-none min-h-[80px]"
                />
              </div>



              <Button
                onClick={handleAnalyze}
                disabled={!hasMinimumPhotos || isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Analyzing...
                  </>
                ) : isAnalyzed ? "Re-Analyze Item" : "Analyze Market & Price"}
              </Button>
            </div>
          </Card>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {!isAnalyzed ? (
              <Card className="flex flex-col items-center justify-center text-center p-8 bg-card/50 border-border/50 border-dashed">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <TrendingUp className="text-muted-foreground w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Waiting for Item...</h3>
                <p className="text-muted-foreground max-w-sm">
                  <span className="hidden md:inline">Upload photos on the left</span>
                  <span className="md:hidden">Upload photos above</span> to unlock AI-powered market analysis, simple cross-posting, and profit predictions.
                </p>
              </Card>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Top Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="text-sm text-muted-foreground mb-1">Estimated Value</div>
                    <div className="text-2xl font-bold text-foreground">{analysis.suggestedPrice}</div>
                  </Card>
                  <Card className="p-4 bg-card border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                    <div className="text-sm text-muted-foreground mb-1">Best Platform</div>
                    <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                      {analysis.recommendation.platform}
                      <TrendingUp size={20} />
                    </div>
                  </Card>
                </div>

                {/* Market Analysis Table */}
                <Card className="overflow-hidden border-border bg-card">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign size={18} className="text-primary" />
                      Market Comparison
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="grid grid-cols-4 p-3 text-xs font-medium text-muted-foreground bg-muted/20">
                      <div>Platform</div>
                      <div>Est. Net Profit</div>
                      <div>Speed</div>
                      <div>Draft</div>
                    </div>
                    {analysis.platforms.map((p) => (
                      <div key={p.name} className={`grid grid-cols-4 p-4 items-center gap-2 transition-colors hover:bg-muted/10 ${p.name === analysis.recommendation.platform ? "bg-green-500/5" : ""}`}>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground">{p.name}</span>
                          <a href={(p as any).url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{p.net}</div>
                          <div className="text-xs text-muted-foreground">List: {p.price}</div>
                        </div>
                        <div className="text-xs">
                          <span className={`px-2 py-1 rounded-full ${p.demand === "Very High" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                            {p.speed}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(p.name)} className="h-8 w-8">
                          {copiedPlatform === p.name ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Listings & Instructions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground">Generated Listings & Settings</h4>
                  {analysis.platforms.map((platform) => (
                    <Card key={platform.name} className={`overflow-hidden transition-all duration-300 ${expandedPlatform === platform.name ? "ring-2 ring-primary/50" : "hover:border-primary/50"}`}>
                      <div
                        className="p-4 bg-card/40 border-b border-border/50 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleExpand(platform.name)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground">{platform.name}</span>
                          <a
                            href={(platform as any).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors p-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                          {platform.name === analysis.recommendation.platform && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500 text-white">RECOMMENDED</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {expandedPlatform === platform.name ? "Hide Details" : "Show Settings"}
                          <Settings size={14} />
                        </div>
                      </div>

                      {/* Collapsible Content */}
                      <div className={`transition-all duration-300 ease-in-out ${expandedPlatform === platform.name ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                        <div className="p-4 bg-muted/10 space-y-4">
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-in-expand">Title & Description</div>
                            <p className="text-sm text-foreground bg-card p-2 rounded border border-border">{platform.listing}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                <Settings size={12} /> Optimization Settings
                              </div>
                              <ul className="text-xs space-y-1.5 list-disc pl-4 text-foreground/90">
                                {platform.settings.map((setting, i) => (
                                  <li key={i}>{setting}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                <Info size={12} /> Listing Instructions
                              </div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                {platform.instructions}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div >
    </section >
  )
}

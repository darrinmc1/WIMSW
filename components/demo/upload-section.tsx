"use client"

import { useState, useRef } from "react"
import NextImage from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Camera, X, Lightbulb, Info } from "lucide-react"
import { PhotoSlot, PhotoCategory } from "./types"
import { resizeImage } from "@/lib/image-utils"
import { PhotoTipsModal } from "@/components/photo-guidance/photo-tips-modal"

interface UploadSectionProps {
    photos: PhotoSlot[]
    setPhotos: React.Dispatch<React.SetStateAction<PhotoSlot[]>>
    userDescription: string
    setUserDescription: (value: string) => void
    onAnalyze: () => void
    isAnalyzing: boolean
    isAnalyzed: boolean
}

export function UploadSection({
    photos,
    setPhotos,
    userDescription,
    setUserDescription,
    onAnalyze,
    isAnalyzing,
    isAnalyzed
}: UploadSectionProps) {
    // Photo Tips Modal State
    const [showPhotoTips, setShowPhotoTips] = useState(false)
    const pendingUploadRef = useRef<{ event: React.ChangeEvent<HTMLInputElement>, category: PhotoCategory } | null>(null)

    const handlePhotoClick = (category: PhotoCategory) => {
        // Check if user has seen tips before
        const hasSeenTips = localStorage.getItem('photoTipsShown')
        
        // If first time, show tips modal before upload
        if (!hasSeenTips) {
            // Store which photo slot they're trying to upload to
            pendingUploadRef.current = { event: null as any, category }
            setShowPhotoTips(true)
            return false // Prevent file picker from opening
        }
        
        return true // Allow upload to proceed
    }

    const handleModalClose = () => {
        setShowPhotoTips(false)
        // If user was trying to upload, trigger the file picker now
        if (pendingUploadRef.current?.category) {
            const category = pendingUploadRef.current.category
            const input = document.getElementById(`photo-upload-${category}`) as HTMLInputElement
            if (input) {
                input.click()
            }
            pendingUploadRef.current = null
        }
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, category: PhotoCategory) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file (JPG, PNG, WEBP, etc.)');
            e.target.value = '';
            return;
        }

        const toastId = toast.loading("Optimizing image for upload...")

        const reader = new FileReader()
        reader.onloadend = async () => {
            if (typeof reader.result === 'string') {
                try {
                    const resizedImage = await resizeImage(reader.result, 1024, 0.8)
                    setPhotos((prev) => prev.map((photo) => (photo.category === category ? { ...photo, image: resizedImage } : photo)))
                    toast.dismiss(toastId)
                    toast.success('Image uploaded successfully!')
                } catch (err) {
                    console.error("Image resizing failed:", err)
                    toast.dismiss(toastId)
                    toast.error("Failed to process image. Please try another one.")
                }
            } else {
                toast.dismiss(toastId)
                toast.error("Failed to read image. Please try again.")
            }
        }
        reader.onerror = () => {
            toast.dismiss(toastId)
            toast.error('Failed to read image file. Please try again.');
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleRemovePhoto = (category: PhotoCategory) => {
        setPhotos((prev) => prev.map((photo) => (photo.category === category ? { ...photo, image: null } : photo)))
    }

    const hasMinimumPhotos = photos.find((p) => p.category === "front")?.image !== null
    const hasAnyPhotos = photos.some((p) => p.image !== null)

    return (
        <>
            {/* Photo Tips Modal */}
            <PhotoTipsModal
                open={showPhotoTips}
                onClose={handleModalClose}
                onDontShowAgain={() => {
                    localStorage.setItem('photoTipsShown', 'true')
                }}
            />

            <Card className="p-6 bg-card border-border flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-foreground">1. Upload Photos</h3>
                </div>

                {/* Prominent Photo Tips Button - Above Upload Area */}
                <Button
                    onClick={() => setShowPhotoTips(true)}
                    variant="outline"
                    className="mb-4 w-full sm:w-auto border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary font-semibold transition-all"
                    size="lg"
                >
                    <Lightbulb className="w-5 h-5 mr-2" />
                    View Photo Tips for Better Results
                    <Info className="w-4 h-4 ml-2 opacity-70" />
                </Button>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 flex-1 content-start">
                    {photos.map((photo) => (
                        <div key={photo.category} className="space-y-2">
                            <div className="text-sm font-medium text-foreground">{photo.label}</div>
                            <div className="relative aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-border hover:border-primary transition-all duration-300 group overflow-hidden">
                                {photo.image ? (
                                    <>
                                        <NextImage
                                            src={photo.image}
                                            alt={photo.label}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            unoptimized
                                        />
                                        <button
                                            onClick={() => handleRemovePhoto(photo.category)}
                                            className="absolute top-1 right-1 h-10 w-10 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-white rounded-full shadow-md transition-colors"
                                            aria-label="Remove photo"
                                        >
                                            <X size={18} className="currentColor" />
                                        </button>
                                    </>
                                ) : (
                                    <label 
                                        htmlFor={`photo-upload-${photo.category}`} 
                                        className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer"
                                        onClick={(e) => {
                                            // Check if we should show tips first
                                            const shouldProceed = handlePhotoClick(photo.category)
                                            if (!shouldProceed) {
                                                e.preventDefault()
                                            }
                                        }}
                                    >
                                        <input
                                            id={`photo-upload-${photo.category}`}
                                            type="file"
                                            accept="image/*"
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

                {/* Helper text for first-time users */}
                {!hasAnyPhotos && (
                    <div className="mt-4 text-sm text-muted-foreground text-center bg-muted/30 rounded-lg p-3 border border-border">
                        <strong className="text-foreground">💡 First time?</strong> Click the button above to see our photo tips for best results!
                    </div>
                )}

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
                        onClick={onAnalyze}
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
        </>
    )
}

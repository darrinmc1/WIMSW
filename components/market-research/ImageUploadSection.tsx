"use client"

import { useRef } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Camera, Upload } from "lucide-react"
import type { ImagePreview, AnalyzedItem } from "./types"

interface ImageUploadSectionProps {
    imagePreview: ImagePreview | null
    setImagePreview: React.Dispatch<React.SetStateAction<ImagePreview | null>>
    analyzeImage: (base64Image: string) => Promise<void>
}

export function ImageUploadSection({ imagePreview, setImagePreview, analyzeImage }: ImageUploadSectionProps) {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

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
                if (!ctx) return reject('Canvas context not available')
                ctx.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL('image/jpeg', quality))
            }
            img.onerror = (err) => reject(err)
        })
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'front' | 'back' | 'label' | 'damage') => {
        console.log(`[Market Research] handleImageUpload called for slot: ${slot}`)
        const file = e.target.files?.[0]

        if (!file) {
            console.log('[Market Research] No file selected')
            return
        }

        console.log('[Market Research] File selected:', { name: file.name, size: file.size, type: file.type })

        if (!file.type.startsWith('image/')) {
            console.error('[Market Research] Invalid file type:', file.type)
            toast.error("Please upload a valid image file (JPG, PNG)")
            e.target.value = ''
            return
        }

        const toastId = toast.loading("Optimizing image for upload...")
        const reader = new FileReader()

        reader.onerror = () => {
            console.error('[Market Research] FileReader error')
            toast.dismiss(toastId)
            toast.error('Failed to read image file. Please try again.')
            e.target.value = ''
        }

        reader.onloadend = async () => {
            console.log('[Market Research] FileReader finished, result type:', typeof reader.result)
            if (typeof reader.result === 'string') {
                try {
                    console.log('[Market Research] Starting image resize...')
                    const resizedImage = await resizeImage(reader.result, 1024, 0.8)
                    console.log('[Market Research] Image resized successfully')

                    setImagePreview(prev => (prev ? { ...prev, [slot]: resizedImage } : null))
                    toast.dismiss(toastId)
                    toast.success('Image uploaded!')

                    if (slot === 'front') {
                        console.log('[Market Research] Front image resized & uploaded, auto-analyzing...')
                        analyzeImage(resizedImage)
                    } else {
                        console.log(`[Market Research] ${slot} image uploaded (not front, skipping auto-analyze)`)
                    }
                } catch (err) {
                    console.error("[Market Research] Image resizing failed:", err)
                    toast.dismiss(toastId)
                    toast.error("Failed to process image. Please try another one.")
                }
            } else {
                console.error('[Market Research] FileReader result is not a string')
                toast.dismiss(toastId)
                toast.error("Failed to read image. Please try again.")
            }
        }

        console.log('[Market Research] Starting FileReader.readAsDataURL...')
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const renderUploadCard = (label: string, slot: 'front' | 'back' | 'label' | 'damage') => {
        const preview = imagePreview?.[slot]

        return (
            <Card
                key={slot}
                className={`relative aspect-square border-2 border-dashed rounded-xl overflow-hidden ${preview ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
            >
                <label htmlFor={`market-upload-${slot}`} className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50 group">
                    <input
                        id={`market-upload-${slot}`}
                        type="file"
                        ref={(el) => { if (fileInputRefs.current) fileInputRefs.current[slot] = el }}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, slot)}
                    />

                    {preview ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <img src={preview} alt={label} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="text-white h-8 w-8" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <Camera className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-700 text-center px-2">{label}</span>
                        </>
                    )}
                </label>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderUploadCard("Front View", "front")}
            {renderUploadCard("Back View", "back")}
            {renderUploadCard("Brand Label", "label")}
            {renderUploadCard("Damage/Wear", "damage")}
        </div>
    )
}

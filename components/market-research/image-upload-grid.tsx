
"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NextImage from "next/image"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Sparkles, CheckCircle } from "lucide-react"
import { resizeImage } from "@/lib/image-utils"
import { AnalyzedItem } from "./types"

interface ImageUploadGridProps {
    imagePreview: {
        front: string | null;
        back: string | null;
        label: string | null;
        damage: string | null;
    } | null;
    onImageUpload: (slot: 'front' | 'back' | 'label' | 'damage', base64Image: string) => void;
    onAnalyze: (base64Image: string) => void;
    itemDetails: AnalyzedItem | null;
    analyzingImage: boolean;
    description: string;
    setDescription: (val: string) => void;
    sizeInput: string;
    setSizeInput: (val: string) => void;
    ageInput: string;
    setAgeInput: (val: string) => void;
}

export function ImageUploadGrid({
    imagePreview,
    onImageUpload,
    onAnalyze,
    itemDetails,
    analyzingImage,
    description,
    setDescription,
    sizeInput,
    setSizeInput,
    ageInput,
    setAgeInput
}: ImageUploadGridProps) {
    const [activeSlot, setActiveSlot] = useState<'front' | 'back' | 'label' | 'damage' | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const libraryInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'library') => {
        const file = e.target.files?.[0]
        if (!file || !activeSlot) return

        setIsDialogOpen(false) // Close dialog immediately

        // File Size Validation (Max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image is too large (Maximum 10MB)", {
                description: "Please attach a smaller version or screenshot."
            })
            e.target.value = ''
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload a valid image file (JPG, PNG)")
            e.target.value = ''
            return
        }

        const toastId = toast.loading("Optimizing image...")

        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                if (typeof reader.result === 'string') {
                    try {
                        const resizedImage = await resizeImage(reader.result, 1024, 0.8)
                        onImageUpload(activeSlot, resizedImage)
                        toast.dismiss(toastId)
                        toast.success('Image uploaded!')

                        // Auto-analyze if front image
                        if (activeSlot === 'front') {
                            onAnalyze(resizedImage)
                        }
                    } catch (err) {
                        toast.dismiss(toastId)
                        toast.error("Failed to process image.")
                    }
                }
            }
            reader.readAsDataURL(file)
        } catch (error) {
            toast.dismiss(toastId)
            toast.error("Error reading file")
        }

        e.target.value = ''
    }

    const openUploadDialog = (slot: 'front' | 'back' | 'label' | 'damage') => {
        setActiveSlot(slot)
        setIsDialogOpen(true)
    }

    const renderUploadCard = (label: string, slot: 'front' | 'back' | 'label' | 'damage') => {
        const preview = imagePreview?.[slot]

        return (
            <Card
                key={slot}
                onClick={() => openUploadDialog(slot)}
                className={`relative aspect-square border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50 group ${preview ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
            >
                <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center">
                    {preview ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <NextImage src={preview} alt={label} fill className="object-cover" unoptimized />

                            {/* Success Overlay - Animated */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 animate-in fade-in duration-300">
                                <div className="bg-indigo-600 text-white rounded-full p-2 shadow-lg animate-in zoom-in duration-300">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>

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
                </div>
            </Card>
        )
    }

    return (
        <div className={!itemDetails && !analyzingImage ? "md:col-span-3 max-w-4xl mx-auto w-full space-y-8 transition-all duration-500 ease-in-out" : "md:col-span-1 space-y-6 transition-all duration-500 ease-in-out"}>

            {/* Upload Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Photo</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-32 flex flex-col gap-3 hover:bg-indigo-50 hover:border-indigo-200"
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <Camera className="h-8 w-8 text-indigo-600" />
                            <span className="font-semibold">Take Photo</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32 flex flex-col gap-3 hover:bg-indigo-50 hover:border-indigo-200"
                            onClick={() => libraryInputRef.current?.click()}
                        >
                            <div className="p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            </div>
                            <span className="font-semibold">Photo Library</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden Inputs for Dialog */}
            <input
                type="file"
                ref={cameraInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e, 'camera')}
            />
            <input
                type="file"
                ref={libraryInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'library')}
            />

            {/* 4-Grid Image Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {renderUploadCard('Front View', 'front')}
                {renderUploadCard('Back View', 'back')}
                {renderUploadCard('Brand Label', 'label')}
                {renderUploadCard('Damage/Wear', 'damage')}
            </div>

            {/* Manual Analyze Button (Fallback) */}
            {imagePreview?.front && !itemDetails && !analyzingImage && (
                <Button
                    onClick={() => onAnalyze(imagePreview.front!)}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md animate-in fade-in"
                >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Item Details
                </Button>
            )}

            {/* Description & Details Fields */}
            <Card className="p-4 border-0 shadow-lg bg-white space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Size (Optional)</label>
                        <input
                            type="text"
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value)}
                            placeholder="e.g. Medium, 10, 32x32"
                            className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Approx Age (Optional)</label>
                        <input
                            type="text"
                            value={ageInput}
                            onChange={(e) => setAgeInput(e.target.value)}
                            placeholder="e.g. 2020, 90s Vintage"
                            className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Extra Details (Defects, etc.)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add any extra details... (e.g. '100% Silk', 'Model #123', 'Missing button', 'Original box included')"
                        className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
                    />
                </div>
            </Card>
        </div>
    )
}

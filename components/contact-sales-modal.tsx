"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Check, Loader2 } from "lucide-react"

export function ContactSalesModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        monthlyItems: '',
        message: ''
    })

    const handleOpen = () => setIsOpen(true)
    const handleClose = () => {
        setIsOpen(false)
        // Reset form after closing if submitted
        if (submitted) {
            setTimeout(() => {
                setSubmitted(false)
                setFormData({
                    name: '',
                    email: '',
                    company: '',
                    phone: '',
                    monthlyItems: '',
                    message: ''
                })
            }, 500)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/contact-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tier: 'business',
                    source: 'pricing_page',
                    timestamp: new Date()
                })
            })

            if (response.ok) {
                setSubmitted(true)
                // Track analytics
                if ((window as any).analytics) {
                    (window as any).analytics.track('Sales Contact Requested', {
                        tier: 'business',
                        estimatedItems: formData.monthlyItems
                    })
                }
            } else {
                alert('Error sending request. Please try again.')
            }
        } catch (error) {
            alert('Error sending request. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Handle ESC key
    if (typeof window !== 'undefined') {
        window.onkeydown = (e) => {
            if (e.key === 'Escape' && isOpen) handleClose()
        }
    }

    return (
        <>
            <Button
                onClick={handleOpen}
                variant="outline"
                size="lg"
                className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold h-12 text-lg"
            >
                Contact Sales
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Let's Talk About Your Business Needs</h2>
                                <p className="text-indigo-600 font-medium mt-1">We'll reach out within 24 hours</p>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {submitted ? (
                                <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                        <Check size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Thank You!</h3>
                                    <p className="text-gray-600 max-w-xs">
                                        We received your request and will reach out within 24 hours.
                                    </p>
                                    <Button onClick={handleClose} className="mt-4 min-w-[120px]">Close</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                                            <Input
                                                id="name"
                                                placeholder="Your full name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="company" className="text-sm font-medium text-gray-700">Company</label>
                                            <Input
                                                id="company"
                                                placeholder="Company name"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="Phone number"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Monthly Items Estimate <span className="text-red-500">*</span></label>
                                        <Select
                                            required
                                            onValueChange={(value) => setFormData({ ...formData, monthlyItems: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select estimated volume" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="400-500">400-500 items/month</SelectItem>
                                                <SelectItem value="500-750">500-750 items/month</SelectItem>
                                                <SelectItem value="750-1000">750-1000 items/month</SelectItem>
                                                <SelectItem value="1000+">1000+ items/month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us about your business needs..."
                                            className="resize-none"
                                            rows={4}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg rounded-lg shadow-md mt-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : "Request Demo"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
